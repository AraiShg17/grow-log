import type { PlantChatMessage, PlantChatMessageDto } from '@/types/plant';

export function toPlantChatMessageDto(message: PlantChatMessage): PlantChatMessageDto {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}
