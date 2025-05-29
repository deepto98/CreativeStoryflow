import { 
  User, InsertUser, 
  Challenge, InsertChallenge,
  Panel, InsertPanel, 
  Vote, InsertVote,
  CommunityChallenge,
  CompletedStoryboard
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Challenge operations
  getChallenge(id: number): Promise<Challenge | undefined>;
  getDailyChallenge(): Promise<Challenge | undefined>;
  getCommunityChallenge(id: number): Promise<Challenge | undefined>;
  getCommunityChallengePreviews(): Promise<CommunityChallenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, data: Partial<Challenge>): Promise<Challenge | undefined>;
  
  // Panel operations
  getPanelsByChallenge(challengeId: number): Promise<Panel[]>;
  getPanel(id: number): Promise<Panel | undefined>;
  createPanel(panel: InsertPanel, userId: number): Promise<Panel>;
  
  // Voting operations
  votePanel(vote: InsertVote, userId: number): Promise<Vote>;
  hasUserVoted(panelId: number, userId: number): Promise<boolean>;
  
  // Completed storyboards
  getCompletedStoryboards(): Promise<CompletedStoryboard[]>;
  getCompletedStoryboard(id: number): Promise<CompletedStoryboard | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private challenges: Map<number, Challenge>;
  private panels: Map<number, Panel>;
  private votes: Map<number, Vote>;
  
  private userId: number;
  private challengeId: number;
  private panelId: number;
  private voteId: number;

  constructor() {
    this.users = new Map();
    this.challenges = new Map();
    this.panels = new Map();
    this.votes = new Map();
    
    this.userId = 1;
    this.challengeId = 1;
    this.panelId = 1;
    this.voteId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      avatarColor: insertUser.avatarColor || this.getRandomColor(),
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Challenge operations
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }
  
  async getDailyChallenge(): Promise<Challenge | undefined> {
    return Array.from(this.challenges.values()).find(
      (challenge) => challenge.isDaily === true && challenge.status === "active"
    );
  }
  
  async getCommunityChallenge(id: number): Promise<Challenge | undefined> {
    return Array.from(this.challenges.values()).find(
      (challenge) => challenge.id === id && challenge.isDaily === false
    );
  }
  
  async getCommunityChallengePreviews(): Promise<CommunityChallenge[]> {
    return Array.from(this.challenges.values())
      .filter(challenge => !challenge.isDaily)
      .slice(0, 4)
      .map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        coverImage: challenge.coverImage || "",
        status: challenge.status,
        contributors: challenge.contributors,
        daysLeft: challenge.daysLeft
      }));
  }
  
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeId++;
    const now = new Date();
    
    const challenge: Challenge = {
      ...insertChallenge,
      id,
      status: "active",
      panelCount: 0,
      contributors: 0,
      timeRemaining: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      createdAt: now,
      endedAt: null,
      daysLeft: 3,
      createdBy: 1, // Default creator ID
    };
    
    this.challenges.set(id, challenge);
    return challenge;
  }
  
  async updateChallenge(id: number, data: Partial<Challenge>): Promise<Challenge | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;
    
    const updatedChallenge = { ...challenge, ...data };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }
  
  // Panel operations
  async getPanelsByChallenge(challengeId: number): Promise<Panel[]> {
    return Array.from(this.panels.values())
      .filter(panel => panel.challengeId === challengeId)
      .sort((a, b) => a.position - b.position);
  }
  
  async getPanel(id: number): Promise<Panel | undefined> {
    return this.panels.get(id);
  }
  
  async createPanel(insertPanel: InsertPanel, userId: number): Promise<Panel> {
    const id = this.panelId++;
    const now = new Date();
    
    // Get the challenge to update panel count
    const challenge = this.challenges.get(insertPanel.challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    
    // Get the username for the panel
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Set the position based on existing panels
    const existingPanelsCount = Array.from(this.panels.values())
      .filter(p => p.challengeId === insertPanel.challengeId)
      .length;
    
    const panel: Panel = {
      ...insertPanel,
      id,
      userId,
      votes: 0,
      position: existingPanelsCount + 1,
      createdAt: now,
      username: user.username
    };
    
    this.panels.set(id, panel);
    
    // Update the challenge
    this.challenges.set(challenge.id, {
      ...challenge,
      panelCount: challenge.panelCount + 1,
      contributors: this.countUniqueContributors(challenge.id)
    });
    
    return panel;
  }
  
  // Voting operations
  async votePanel(insertVote: InsertVote, userId: number): Promise<Vote> {
    // Check if user has already voted for this panel
    const alreadyVoted = await this.hasUserVoted(insertVote.panelId, userId);
    if (alreadyVoted) {
      throw new Error("User has already voted for this panel");
    }
    
    const id = this.voteId++;
    const now = new Date();
    
    const vote: Vote = {
      ...insertVote,
      id,
      userId,
      createdAt: now
    };
    
    this.votes.set(id, vote);
    
    // Update panel vote count
    const panel = this.panels.get(insertVote.panelId);
    if (panel) {
      this.panels.set(panel.id, {
        ...panel,
        votes: panel.votes + 1
      });
    }
    
    return vote;
  }
  
  async hasUserVoted(panelId: number, userId: number): Promise<boolean> {
    return Array.from(this.votes.values()).some(
      vote => vote.panelId === panelId && vote.userId === userId
    );
  }
  
  // Completed storyboards
  async getCompletedStoryboards(): Promise<CompletedStoryboard[]> {
    const completedChallenges = Array.from(this.challenges.values())
      .filter(challenge => challenge.status === "completed")
      .slice(0, 3);
    
    return Promise.all(completedChallenges.map(async (challenge) => {
      const panels = await this.getPanelsByChallenge(challenge.id);
      const contributors = this.getUniqueContributors(challenge.id);
      
      return {
        id: challenge.id,
        title: challenge.title,
        category: challenge.category,
        coverImage: panels.length > 0 ? panels[0].imageUrl : "",
        panelCount: panels.length,
        completedAt: challenge.endedAt || challenge.createdAt,
        contributors
      };
    }));
  }
  
  async getCompletedStoryboard(id: number): Promise<CompletedStoryboard | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;
    
    const panels = await this.getPanelsByChallenge(id);
    const contributors = this.getUniqueContributors(id);
    
    return {
      id: challenge.id,
      title: challenge.title,
      category: challenge.category,
      coverImage: panels.length > 0 ? panels[0].imageUrl : "",
      panelCount: panels.length,
      completedAt: challenge.endedAt || challenge.createdAt,
      contributors
    };
  }
  
  // Helper methods
  private countUniqueContributors(challengeId: number): number {
    const contributorIds = new Set<number>();
    
    Array.from(this.panels.values())
      .filter(panel => panel.challengeId === challengeId)
      .forEach(panel => contributorIds.add(panel.userId));
    
    return contributorIds.size;
  }
  
  private getUniqueContributors(challengeId: number): string[] {
    const contributors: string[] = [];
    const contributorIds = new Set<number>();
    
    Array.from(this.panels.values())
      .filter(panel => panel.challengeId === challengeId)
      .forEach(panel => {
        if (!contributorIds.has(panel.userId)) {
          contributorIds.add(panel.userId);
          const user = this.users.get(panel.userId);
          if (user) {
            contributors.push(user.username);
          }
        }
      });
    
    return contributors;
  }
  
  private getRandomColor(): string {
    const colors = ["#6D28D9", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Initialize sample data for demo
  private initializeSampleData() {
    // Sample users
    const sampleUsers: InsertUser[] = [
      { username: "SpaceWriter", password: "password123", avatarColor: "#6D28D9" },
      { username: "CosmicTales", password: "password123", avatarColor: "#EC4899" },
      { username: "StarGazer42", password: "password123", avatarColor: "#F59E0B" },
      { username: "AlienArtist", password: "password123", avatarColor: "#10B981" }
    ];
    
    sampleUsers.forEach(user => this.createUser(user));
    
    // Sample daily challenge
    const dailyChallenge: InsertChallenge = {
      title: "Space Explorer's First Contact",
      description: "Today's theme invites you to continue the story of a space explorer who discovers something unexpected on a distant planet.",
      tags: ["Sci-Fi", "Adventure", "Mystery"],
      totalPanels: 6,
      isDaily: true,
      category: "Sci-Fi",
      coverImage: ""
    };
    
    const challenge = this.createChallenge(dailyChallenge);
    
    // Sample panels for daily challenge
    const samplePanels = [
      {
        challengeId: 1,
        prompt: "A space explorer preparing for a mission to a distant planet",
        caption: "Captain Lisa prepares for her first solo mission to Planet Xyria.",
        imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=600&h=600&fit=crop",
        userId: 1
      },
      {
        challengeId: 1,
        prompt: "A spaceship landing on an alien world with strange terrain",
        caption: "The landing was rougher than expected. Something interfered with the ship's systems.",
        imageUrl: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?w=600&h=600&fit=crop",
        userId: 2
      },
      {
        challengeId: 1,
        prompt: "Discovering mysterious alien structures that glow with strange energy",
        caption: "Lisa discovered strange structures that seemed to pulse with an inner light.",
        imageUrl: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&h=600&fit=crop",
        userId: 3
      },
      {
        challengeId: 1,
        prompt: "A shadowy figure appearing in the distance, clearly not human",
        caption: "A silhouette appeared against the horizon. Not human, but somehow... familiar.",
        imageUrl: "https://images.unsplash.com/photo-1501862700950-18382cd41497?w=600&h=600&fit=crop",
        userId: 4
      }
    ];
    
    samplePanels.forEach(panel => {
      this.createPanel(panel, panel.userId);
    });
    
    // Sample community challenges
    const communityChallenges = [
      {
        title: "Underwater Adventure",
        description: "Create a story about deep-sea explorers",
        tags: ["Adventure", "Mystery", "Science"],
        isDaily: false,
        category: "Adventure",
        coverImage: "https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=600&h=200&fit=crop",
        status: "active",
        daysLeft: 2,
        contributors: 8
      },
      {
        title: "Ancient Mystery",
        description: "Unravel secrets of a forgotten temple",
        tags: ["Mystery", "History", "Adventure"],
        isDaily: false,
        category: "Mystery",
        coverImage: "https://images.unsplash.com/photo-1523286877159-d9636545890c?w=600&h=200&fit=crop",
        status: "active",
        daysLeft: 5,
        contributors: 12
      },
      {
        title: "Dream Jumper",
        description: "A person who can jump through dreams",
        tags: ["Fantasy", "Surreal", "Adventure"],
        isDaily: false,
        category: "Fantasy",
        coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=200&fit=crop",
        status: "Coming Soon",
        daysLeft: 1,
        contributors: 0
      },
      {
        title: "Time Detectives",
        description: "Solve mysteries across different eras",
        tags: ["Sci-Fi", "Mystery", "History"],
        isDaily: false,
        category: "Sci-Fi",
        coverImage: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=600&h=200&fit=crop",
        status: "Completed",
        daysLeft: 3,
        contributors: 24
      }
    ];
    
    communityChallenges.forEach(challenge => {
      const newChallenge = this.createChallenge(challenge);
      this.challenges.set(newChallenge.id, {
        ...newChallenge,
        status: challenge.status,
        daysLeft: challenge.daysLeft,
        contributors: challenge.contributors
      });
    });
    
    // Sample completed storyboards
    const completedStoryboards = [
      {
        title: "Robot's Day Out",
        description: "A heartwarming tale of a robot exploring human emotions",
        tags: ["Sci-Fi", "Comedy", "Heartwarming"],
        isDaily: false,
        category: "Sci-Fi",
        coverImage: "https://images.unsplash.com/photo-1566619893999-537a3ad11049?w=800&h=450&fit=crop",
        status: "completed",
        totalPanels: 6,
        panelCount: 6,
        endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        title: "The Last Sunset",
        description: "A group of friends witness the final sunset on Earth",
        tags: ["Fantasy", "Drama", "Apocalyptic"],
        isDaily: false,
        category: "Fantasy",
        coverImage: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&h=450&fit=crop",
        status: "completed",
        totalPanels: 6,
        panelCount: 6,
        endedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        title: "Haunted Memories",
        description: "Exploring a house where memories come to life",
        tags: ["Horror", "Psychological", "Mystery"],
        isDaily: false,
        category: "Horror",
        coverImage: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&h=450&fit=crop",
        status: "completed",
        totalPanels: 6,
        panelCount: 6,
        endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ];
    
    completedStoryboards.forEach(storyboard => {
      const newStoryboard = this.createChallenge(storyboard);
      this.challenges.set(newStoryboard.id, {
        ...newStoryboard,
        status: storyboard.status,
        panelCount: storyboard.panelCount,
        endedAt: storyboard.endedAt
      });
      
      // Add mock panels for each completed storyboard
      for (let i = 0; i < storyboard.panelCount; i++) {
        const userId = (i % 4) + 1; // Cycle through the 4 sample users
        this.createPanel({
          challengeId: newStoryboard.id,
          prompt: `Sample panel ${i+1} for ${storyboard.title}`,
          caption: `Caption for panel ${i+1}`,
          imageUrl: storyboard.coverImage,
        }, userId);
      }
    });
  }
}

export const storage = new MemStorage();
