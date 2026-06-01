'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toActionErrorMessage } from '@/lib/errors/actionError';
import { generatePlantRegistrationBundle } from '@/lib/openai/careGuide';
import { generateLogAdvice } from '@/lib/openai/logAdvice';
import {
  createPlant,
  createPlantLog,
  deletePlantLog,
  deletePlantWithLogs,
  getPlant,
  getPlantLog,
  listPlantLogs,
  updatePlant,
} from '@/lib/firestore/plants';
import {
  uploadPhotosFromFormData,
  validateLogPhotosFormData,
  validatePhotoFormData,
} from '@/lib/photos/uploadPhotosFromFormData';
import { getCareLogMemo, isCareLogKind } from '@/lib/plants/careLogMemos';
import { normalizePhotoUrls } from '@/lib/photos/normalizePhotos';
import { parsePhotoFilesFromFormData } from '@/lib/photos/parsePhotoFormData';
import { deleteStorageObjectsByUrls } from '@/lib/storage/upload';

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createPlantAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get('name') ?? '').trim();
  const photoError = validatePhotoFormData(formData);

  if (!name) {
    return { success: false, error: '植物名を入力してください。' };
  }

  if (photoError) {
    return { success: false, error: photoError };
  }

  try {
    const uploaded = await uploadPhotosFromFormData(formData, 'plants');

    const primaryAi = uploaded.aiBuffers[0];
    if (!primaryAi) {
      return { success: false, error: '写真を1枚以上選択してください。' };
    }

    const bundle = await generatePlantRegistrationBundle({
      name,
      photoBuffer: primaryAi.buffer,
      mimeType: primaryAi.mimeType,
    });

    const plantId = await createPlant({
      name,
      photoUrls: uploaded.photoUrls,
      aiPhotoIndex: uploaded.aiPhotoIndex,
      careGuide: bundle.careGuide,
      sunlightTag: bundle.sunlightTag,
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
  const photoError = validateLogPhotosFormData(formData);

  if (photoError) {
    return { success: false, error: photoError };
  }

  const observedAt = new Date();

  try {
    const pastLogs = await listPlantLogs(plantId, 10);
    const files = parsePhotoFilesFromFormData(formData);

    let photoUrls: string[] = [];
    let aiPhotoIndex = 0;
    let aiPhotoIndices: number[] | undefined;
    let aiAdvice = '';
    let visualSnapshot: string | undefined;

    if (files.length > 0) {
      const uploaded = await uploadPhotosFromFormData(formData, 'logs');
      photoUrls = uploaded.photoUrls;
      aiPhotoIndex = uploaded.aiPhotoIndex;
      aiPhotoIndices = uploaded.aiPhotoIndices;
      const generated = await generateLogAdvice({
        plantName: plant.name,
        careGuide: plant.careGuide,
        memo,
        photos: uploaded.aiBuffers,
        pastLogs,
      });
      aiAdvice = generated.aiAdvice;
      visualSnapshot = generated.visualSnapshot || undefined;
    } else if (!memo) {
      return {
        success: false,
        error: 'メモを入力するか、写真を1枚以上追加してください。',
      };
    }

    await createPlantLog(plantId, {
      photoUrls,
      aiPhotoIndex,
      aiPhotoIndices,
      memo,
      aiAdvice,
      visualSnapshot,
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

export async function bulkCreateCareLogsAction(
  plantIds: string[],
  kind: string,
): Promise<ActionResult> {
  if (!isCareLogKind(kind)) {
    return { success: false, error: '不正な操作です。' };
  }

  const uniqueIds = [...new Set(plantIds.map((id) => id.trim()).filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { success: false, error: '植物を1つ以上選択してください。' };
  }

  const memo = getCareLogMemo(kind);
  const observedAt = new Date();

  try {
    for (const plantId of uniqueIds) {
      const plant = await getPlant(plantId);
      if (!plant) {
        return { success: false, error: '選択した植物の一部が見つかりません。' };
      }

      await createPlantLog(plantId, {
        photoUrls: [],
        aiPhotoIndex: 0,
        memo,
        aiAdvice: '',
        observedAt,
      });
    }

    revalidatePath('/');
    for (const plantId of uniqueIds) {
      revalidatePath(`/plants/${plantId}`);
    }

    return { success: true };
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

export async function deletePlantLogAction(
  plantId: string,
  logId: string,
  _prevState: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  const plant = await getPlant(plantId);
  if (!plant) {
    return { success: false, error: '植物が見つかりません。' };
  }

  const log = await getPlantLog(plantId, logId);
  if (!log) {
    return { success: false, error: '観察記録が見つかりません。' };
  }

  try {
    const photoUrls = normalizePhotoUrls(log.photoUrls);
    if (photoUrls.length > 0) {
      await deleteStorageObjectsByUrls(photoUrls);
    }

    await deletePlantLog(plantId, logId);

    revalidatePath('/');
    revalidatePath(`/plants/${plantId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: toActionErrorMessage(error, '観察記録の削除に失敗しました。'),
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
    const photoUrls = [
      ...plant.photoUrls,
      ...logs.flatMap((log) => log.photoUrls),
    ].filter(Boolean);

    await deleteStorageObjectsByUrls([...new Set(photoUrls)]);
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
