'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toActionErrorMessage } from '@/lib/errors/actionError';
import { generateCareGuide } from '@/lib/openai/careGuide';
import { generateLogAdvice } from '@/lib/openai/logAdvice';
import {
  createPlant,
  createPlantLog,
  deletePlantWithLogs,
  getPlant,
  listPlantLogs,
  updatePlant,
} from '@/lib/firestore/plants';
import {
  deleteStorageObjectsByUrls,
  uploadPlantPhotoBuffer,
} from '@/lib/storage/upload';

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createPlantAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get('name') ?? '').trim();
  const photo = formData.get('photo');

  if (!name) {
    return { success: false, error: '植物名を入力してください。' };
  }

  if (!(photo instanceof File) || photo.size === 0) {
    return { success: false, error: '写真を選択してください。' };
  }

  try {
    const mimeType = photo.type || 'image/jpeg';
    const photoBuffer = Buffer.from(await photo.arrayBuffer());

    const [photoUrl, careGuide] = await Promise.all([
      uploadPlantPhotoBuffer(photoBuffer, mimeType, 'plants'),
      generateCareGuide({ name, photoBuffer, mimeType }),
    ]);

    const plantId = await createPlant({
      name,
      firstPhotoUrl: photoUrl,
      careGuide,
    });

    revalidatePath('/');
    redirect(`/plants/${plantId}`);
  } catch (error) {
    return {
      success: false,
      error: toActionErrorMessage(error, '植物の登録に失敗しました。'),
    };
  }
}

export async function createPlantLogAction(
  plantId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const plant = await getPlant(plantId);
  if (!plant) {
    return { success: false, error: '植物が見つかりません。' };
  }

  const memo = String(formData.get('memo') ?? '').trim();
  const photo = formData.get('photo');

  if (!(photo instanceof File) || photo.size === 0) {
    return { success: false, error: '写真を選択してください。' };
  }

  const observedAt = new Date();

  try {
    const mimeType = photo.type || 'image/jpeg';
    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    const pastLogs = await listPlantLogs(plantId, 5);

    const [photoUrl, aiAdvice] = await Promise.all([
      uploadPlantPhotoBuffer(photoBuffer, mimeType, 'logs'),
      generateLogAdvice({
        plantName: plant.name,
        careGuide: plant.careGuide,
        memo,
        photoBuffer,
        mimeType,
        pastLogs,
      }),
    ]);

    await createPlantLog(plantId, {
      photoUrl,
      memo,
      aiAdvice,
      observedAt,
    });

    revalidatePath(`/plants/${plantId}`);
    redirect(`/plants/${plantId}`);
  } catch (error) {
    return {
      success: false,
      error: toActionErrorMessage(error, '観察記録の追加に失敗しました。'),
    };
  }
}

export async function updatePlantAction(
  plantId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const currentPlant = await getPlant(plantId);
  if (!currentPlant) {
    return { success: false, error: '植物が見つかりません。' };
  }

  const name = String(formData.get('name') ?? '').trim();

  if (!name) {
    return { success: false, error: '植物名を入力してください。' };
  }

  try {
    await updatePlant(plantId, {
      name,
    });

    revalidatePath('/');
    revalidatePath(`/plants/${plantId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: toActionErrorMessage(error, '植物の更新に失敗しました。'),
    };
  }
}

export async function deletePlantAction(plantId: string): Promise<ActionResult> {
  const plant = await getPlant(plantId);
  if (!plant) {
    return { success: false, error: '植物が見つかりません。' };
  }

  try {
    const logs = await listPlantLogs(plantId, 0);
    const photoUrls = [plant.firstPhotoUrl, ...logs.map((log) => log.photoUrl)];

    await deleteStorageObjectsByUrls(photoUrls);
    await deletePlantWithLogs(plantId);

    revalidatePath('/');
  } catch (error) {
    return {
      success: false,
      error: toActionErrorMessage(error, '植物の削除に失敗しました。'),
    };
  }

  redirect('/');
}
