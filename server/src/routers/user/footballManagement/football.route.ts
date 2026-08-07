import { Router } from "express";
import { FootballProfileController } from "../../../controllers/user/footballManagement/profile.controller";
import { FootballTeamController } from "../../../controllers/user/footballManagement/team.controller";
import { MatchController } from "../../../controllers/user/matchManagement/match.controller";
import { TournamentController } from "../../../controllers/user/tournamentManagement/tournament.controller";
import { authenticateUser } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/football/profile", authenticateUser, FootballProfileController.register);
router.get("/football/profile/check", authenticateUser, FootballProfileController.check);
router.post("/football/teams", authenticateUser, FootballTeamController.create);
router.get("/football/teams", authenticateUser, FootballTeamController.all);
router.get("/football/teams/mine", authenticateUser, FootballTeamController.mine);
router.get("/football/teams/:teamId", FootballTeamController.getById);
router.post("/football/teams/:teamId/members", authenticateUser, FootballTeamController.addMember);
router.patch("/football/teams/:teamId/captain", authenticateUser, FootballTeamController.updateCaptain);
router.delete("/football/teams/:teamId/members/:playerId", authenticateUser, FootballTeamController.removeMember);
router.get("/football/players", FootballTeamController.players);
router.get("/football/players/:profileId/stats", MatchController.playerStats);

router.post("/football/matches", authenticateUser, MatchController.create);
router.post("/football/matches/schedule", authenticateUser, MatchController.schedule);
router.get("/football/matches/mine", authenticateUser, MatchController.mine);
router.get("/football/matches/:id", MatchController.getById);
router.post("/football/matches/:id/start", authenticateUser, MatchController.start);
router.post("/football/matches/:id/abandon", authenticateUser, MatchController.abandon);
router.post("/football/matches/:id/events", authenticateUser, MatchController.addEvent);
router.patch("/football/matches/:id/possession", authenticateUser, MatchController.updatePossession);
router.patch("/football/matches/:id/possession/pause", authenticateUser, MatchController.pausePossession);
router.patch("/football/matches/:id/possession/resume", authenticateUser, MatchController.resumePossession);
router.post("/football/matches/:id/end", authenticateUser, MatchController.end);
router.get("/football/teams/:teamId/matches", MatchController.teamMatches);

router.post("/football/tournaments", authenticateUser, TournamentController.create);
router.get("/football/tournaments/mine", authenticateUser, TournamentController.mine);
router.get("/football/tournaments/:id", TournamentController.getById);
router.post("/football/tournaments/:id/start", authenticateUser, TournamentController.start);
router.post("/football/tournaments/:id/fixtures/:fixtureId/start-match", authenticateUser, TournamentController.startFixtureMatch);
router.patch("/football/tournaments/:id/fixtures/:fixtureId/schedule", authenticateUser, TournamentController.setFixtureSchedule);
router.delete("/football/tournaments/:id", authenticateUser, TournamentController.remove);

export default router;
