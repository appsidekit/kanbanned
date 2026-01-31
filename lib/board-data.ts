import { AppData } from "./types";

export const appData: AppData = {
  version: 1,
  boards: [
    {
      id: "board-1",
      name: "kanbanned",
      columns: [
        {
          id: "col-1",
          name: "To Do",
          cards: [
            {
              id: "card-1",
              title: "Design the landing page",
              description: "Create wireframes and mockups for the main landing page",
              priority: "high",
            },
            {
              id: "card-2",
              title: "Set up database schema",
              description: "Define tables and relationships for the application",
              priority: "high",
            },
            {
              id: "card-3",
              title: "Write API documentation",
              description: "Document all REST endpoints with examples",
              priority: "low",
            },
          ],
        },
        {
          id: "col-2",
          name: "Doing",
          cards: [
            {
              id: "card-4",
              title: "Implement user authentication",
              description: "Add login, signup, and session management",
              priority: "high",
            },
            {
              id: "card-5",
              title: "Build dashboard components",
              description: "Create reusable chart and stat components",
              priority: "medium",
            },
          ],
        },
        {
          id: "col-3",
          name: "In Review",
          cards: [
            {
              id: "card-6",
              title: "Code review for payment flow",
              description: "Review and test the Stripe integration",
              priority: "high",
            },
          ],
        },
        {
          id: "col-4",
          name: "Done",
          cards: [
            {
              id: "card-7",
              title: "Project setup",
              description: "Initialize Next.js project with TypeScript and Tailwind",
              priority: "medium",
            },
            {
              id: "card-8",
              title: "Configure CI/CD pipeline",
              description: "Set up GitHub Actions for automated deployments",
              priority: "medium",
            },
          ],
        },
      ],
    },
    {
      id: "board-2",
      name: "Personal",
      columns: [
        {
          id: "col-5",
          name: "To Do",
          cards: [],
        },
        {
          id: "col-6",
          name: "Done",
          cards: [],
        },
      ],
    },
  ],
};
