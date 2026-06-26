import type { MostLikelyQuestion } from "../../../../../../packages/contracts/src";

export const defaultMostLikelyQuestionDeck: MostLikelyQuestion[] = [
  {
    id: "arrive_late",
    prompt: "Quem e mais provavel que chegue atrasado e ainda culpe o transito?",
    contentLevel: "friends",
  },
  {
    id: "karaoke",
    prompt: "Quem e mais provavel que transforme uma musica qualquer em karaoke?",
    contentLevel: "friends",
  },
  {
    id: "order_for_table",
    prompt: "Quem e mais provavel que peca comida para a mesa toda sem perguntar?",
    contentLevel: "bar",
  },
  {
    id: "lost_phone",
    prompt: "Quem e mais provavel que perca o telemovel estando com ele na mao?",
    contentLevel: "friends",
  },
  {
    id: "last_round",
    prompt: "Quem e mais provavel que diga 'so mais uma' e fique ate ao fim?",
    contentLevel: "bar",
  },
];
