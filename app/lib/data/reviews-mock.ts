export type Review = {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  quote: string;
};

export const mockReviews: Review[] = [
  {
    id: "1",
    author: "Alex Chen",
    avatar: "/avatars/alex.jpg",
    rating: 5,
    quote:
      "Clear structure and hands-on challenges. Finished the course in a week and landed my first Solana gig.",
  },
  {
    id: "2",
    author: "Maria Santos",
    avatar: "/avatars/maria.jpg",
    rating: 5,
    quote:
      "Best Anchor tutorial I've found. The PDA and CPI sections are especially well explained.",
  },
  {
    id: "3",
    author: "Jordan Blake",
    avatar: "/avatars/jordan.jpg",
    rating: 4,
    quote:
      "Solid fundamentals. Would love to see more advanced CPIs and testing patterns in a follow-up.",
  },
];
