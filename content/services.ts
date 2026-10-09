type Step = { title: string; detail: string };

export const projectSteps: Step[] = [
  {
    title: "Chart",
    detail:
      "Who it is for, what the first version must do, and what can wait. A short plan before any code.",
  },
  {
    title: "Build",
    detail:
      "The screens, the backend and the database, built together so they fit, and shown to you as they take shape. Usually Next.js and PostgreSQL; Spring Boot when the backend calls for it.",
  },
  {
    title: "Launch",
    detail:
      "Deployed on your domain and handed over with everything you need to own it: the code, the accounts, and how to run it.",
  },
];
