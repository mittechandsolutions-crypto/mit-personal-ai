export type Agent = {
  name: string;
  category: string;
  icon: string;
  color: string;
  tint: string;
  description: string;
};

export const agents: Agent[] = [
  { name: "Everyday Assistant", category: "Productivity", icon: "✳", color: "#30273d", tint: "#cfadff", description: "A thoughtful all-rounder for everyday questions and tasks." },
  { name: "Writing Coach", category: "Writing", icon: "✎", color: "#2c2835", tint: "#c5a6ef", description: "Shape rough thoughts into clear, confident writing." },
  { name: "Research Partner", category: "Learning", icon: "⌕", color: "#292d3a", tint: "#a9b5ff", description: "Break down a topic and help you explore it step by step." },
  { name: "Study Buddy", category: "Learning", icon: "▤", color: "#25332f", tint: "#8ed7b6", description: "Make learning easier with simple explanations and quizzes." },
  { name: "Code Companion", category: "Technology", icon: "</>", color: "#243136", tint: "#8dd0df", description: "Think through code, learn concepts, and debug with care." },
  { name: "Creative Muse", category: "Creative", icon: "✧", color: "#382a35", tint: "#f1a9c8", description: "Get unstuck and discover fresh angles for your ideas." },
  { name: "Project Planner", category: "Productivity", icon: "◷", color: "#343027", tint: "#e5bf7d", description: "Turn a big goal into a realistic, manageable plan." },
  { name: "Email & Messages", category: "Writing", icon: "↗", color: "#302a3c", tint: "#c8a9ff", description: "Find the right words for messages that matter." },
  { name: "Language Partner", category: "Learning", icon: "文", color: "#263433", tint: "#91d0bf", description: "Practice a language through friendly conversation." },
  { name: "Wellness Guide", category: "Lifestyle", icon: "♡", color: "#362a31", tint: "#efa5b7", description: "Build gentler routines for everyday well-being." },
  { name: "Meal Planner", category: "Lifestyle", icon: "◉", color: "#343229", tint: "#e7c68e", description: "Find meal inspiration and plan your week simply." },
  { name: "Travel Curator", category: "Lifestyle", icon: "✈", color: "#29313a", tint: "#a7c7ed", description: "Dream up an itinerary around your kind of trip." },
  { name: "Career Mentor", category: "Career", icon: "↗", color: "#2c2d3b", tint: "#aeb4f6", description: "Prepare for career conversations and next steps." },
  { name: "Decision Guide", category: "Productivity", icon: "◇", color: "#312c39", tint: "#cfb5e9", description: "Compare options and get clear on what matters to you." },
  { name: "Meeting Scribe", category: "Productivity", icon: "▣", color: "#2d3331", tint: "#9bcbb5", description: "Organize notes, agendas, and thoughtful follow-ups." }
];

export const categories = ["All", ...new Set(agents.map((agent) => agent.category))];

export function detectAgent(text: string) {
  if (/\b(email|e-mail|message|write|draft)\b/i.test(text)) return "Writing Coach";
  if (/\b(plan|organize|schedule|week|day|prioriti)\b/i.test(text)) return "Project Planner";
  if (/\b(idea|brainstorm|creative)\b/i.test(text)) return "Creative Muse";
  if (/\b(explain|what is|how does|teach|learn)\b/i.test(text)) return "Study Buddy";
  if (/\b(code|bug|error|javascript|python|html|css|program)\b/i.test(text)) return "Code Companion";
  return "Everyday Assistant";
}

export function previewReply(prompt: string) {
  if (/\b(email|e-mail|message|reply|write|draft)\b/i.test(prompt)) {
    return "Here's a starting point you can personalize:\n\nSubject: Following up\n\nHi [Name],\n\nI hope you're doing well. I wanted to follow up about [topic]. When you have a moment, could you share an update? Happy to provide anything else you need.\n\nThanks,\n[Your name]\n\nTell me the audience and tone you want, and I can tailor it.";
  }
  if (/\b(plan|organize|schedule|week|day|prioriti)\b/i.test(prompt)) {
    return "Let's make this manageable:\n\n1. Pick your three most important outcomes.\n2. Put the task that needs the most focus into your best-energy time.\n3. Group quick tasks together and leave a little breathing room.\n\nShare your tasks and deadlines, and I can help make a specific schedule.";
  }
  if (/\b(idea|brainstorm|creative|project)\b/i.test(prompt)) {
    return "Let's open up a few possibilities:\n\n• Make a small version you can finish in an afternoon.\n• Combine two things you enjoy in an unexpected way.\n• Solve one tiny everyday annoyance for yourself.\n• Revisit something you started before and give it a new twist.\n\nTell me your interests or constraints and I'll brainstorm ideas that fit.";
  }
  if (/\b(explain|what is|how does|teach|learn)\b/i.test(prompt)) {
    return "A useful way to approach a new topic is to start with the big idea, connect it to a familiar example, and then look at the details. Which part would you like me to explain first?";
  }
  if (/\b(code|bug|error|javascript|python|html|css|program)\b/i.test(prompt)) {
    return "I can help you think through this. Share the relevant code or exact error, what you expected to happen, and what happened instead. This preview doesn't execute or inspect your files.";
  }
  return "I'm here to help you work through that. What would a useful outcome look like for you? Share any deadline or constraints, and let me know whether you'd like ideas, a step-by-step plan, or a finished draft.";
}
