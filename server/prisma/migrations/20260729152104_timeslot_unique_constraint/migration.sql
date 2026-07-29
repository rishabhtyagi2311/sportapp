-- Dedup existing TimeSlot rows before adding a unique constraint on
-- (venueId, varietyId, date, startTime, endTime). Without this constraint,
-- createMany({ skipDuplicates: true }) in slotGenerator.ts is a no-op — there
-- is nothing for the DB to consider "duplicate" against, so concurrent or
-- repeated generation runs (e.g. the self-heal path on the public slots
-- read, racing the background rolling-window job) can insert genuine
-- duplicate rows for the same slot.
--
-- Within each duplicate group, keep a booked/blocked row over an 'available'
-- one (never silently delete evidence of a real booking), and among ties on
-- status keep the oldest row by id.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "venueId", "varietyId", "date", "startTime", "endTime"
           ORDER BY (status <> 'available') DESC, id ASC
         ) AS rn
  FROM "TimeSlot"
)
DELETE FROM "TimeSlot"
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_venueId_varietyId_date_startTime_endTime_key" ON "TimeSlot"("venueId", "varietyId", "date", "startTime", "endTime");
