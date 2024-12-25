import { z } from "zod";

export const messageSchema = z.object({
  chatId: z.string().nonempty(),
  content: z.string().min(1, 'Content is required'),
});
