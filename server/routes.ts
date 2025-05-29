import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateImage, suggestCaption, generateChallengeTheme } from "./openai";
import { insertPanelSchema, insertChallengeSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Mock current user for demo (in a real app, this would be handled by auth)
const CURRENT_USER_ID = 1;

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Auth
  app.get("/api/auth/me", async (req, res) => {
    const user = await storage.getUser(CURRENT_USER_ID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // Challenges
  app.get("/api/challenges/daily", async (req, res) => {
    const challenge = await storage.getDailyChallenge();
    if (!challenge) {
      return res.status(404).json({ message: "No daily challenge found" });
    }
    res.json(challenge);
  });
  
  app.get("/api/challenges/community", async (req, res) => {
    const challenges = await storage.getCommunityChallengePreviews();
    res.json(challenges);
  });
  
  app.get("/api/challenges/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid challenge ID" });
    }
    
    const challenge = await storage.getChallenge(id);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    res.json(challenge);
  });
  
  app.post("/api/challenges", async (req, res) => {
    try {
      const data = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(data);
      res.status(201).json(challenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // Panels
  app.get("/api/panels/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid panel ID" });
    }
    
    const panel = await storage.getPanel(id);
    if (!panel) {
      return res.status(404).json({ message: "Panel not found" });
    }
    
    res.json(panel);
  });
  
  app.get("/api/panels", async (req, res) => {
    const challengeId = parseInt(req.query.challengeId as string);
    if (isNaN(challengeId)) {
      return res.status(400).json({ message: "Invalid challenge ID" });
    }
    
    const panels = await storage.getPanelsByChallenge(challengeId);
    res.json(panels);
  });
  
  app.post("/api/panels/generate", async (req, res) => {
    try {
      const { prompt, challengeId } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ message: "Valid prompt is required" });
      }
      
      if (!challengeId || isNaN(parseInt(challengeId))) {
        return res.status(400).json({ message: "Valid challenge ID is required" });
      }
      
      // Generate image from prompt
      const imageUrl = await generateImage(prompt);
      
      // Return the generated image URL
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/panels", async (req, res) => {
    try {
      const data = insertPanelSchema.parse(req.body);
      const panel = await storage.createPanel(data, CURRENT_USER_ID);
      res.status(201).json(panel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // Voting
  app.post("/api/votes", async (req, res) => {
    try {
      const data = insertVoteSchema.parse(req.body);
      
      // Check if user has already voted for this panel
      const hasVoted = await storage.hasUserVoted(data.panelId, CURRENT_USER_ID);
      if (hasVoted) {
        return res.status(400).json({ message: "You have already voted for this panel" });
      }
      
      const vote = await storage.votePanel(data, CURRENT_USER_ID);
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // Completed storyboards
  app.get("/api/storyboards/completed", async (req, res) => {
    const storyboards = await storage.getCompletedStoryboards();
    res.json(storyboards);
  });
  
  app.get("/api/storyboards/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid storyboard ID" });
    }
    
    const storyboard = await storage.getCompletedStoryboard(id);
    if (!storyboard) {
      return res.status(404).json({ message: "Storyboard not found" });
    }
    
    res.json(storyboard);
  });
  
  // AI-assisted caption generation
  app.post("/api/captions/suggest", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ message: "Valid prompt is required" });
      }
      
      const caption = await suggestCaption(prompt);
      res.json({ caption });
    } catch (error) {
      console.error("Error suggesting caption:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Generate new challenge theme
  app.post("/api/challenges/generate-theme", async (req, res) => {
    try {
      const theme = await generateChallengeTheme();
      res.json(theme);
    } catch (error) {
      console.error("Error generating theme:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
