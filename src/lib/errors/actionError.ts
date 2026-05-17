import { isRedirectError } from 'next/dist/client/components/redirect-error';

function isOpenAiAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const status = 'status' in error ? error.status : undefined;
  return status === 401 || status === 403;
}

function isGcsError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return /storage|bucket|403|404/i.test(error.message);
}

function isFirestoreError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return /firestore|NOT_FOUND|PERMISSION_DENIED/i.test(error.message);
}

export function toActionErrorMessage(error: unknown, fallback: string): string {
  if (isRedirectError(error)) {
    throw error;
  }

  if (isOpenAiAuthError(error)) {
    return 'OpenAI APIキーが無効です。.env の OPENAI_API_KEY に正しいキーを設定し、開発サーバーを再起動してください。';
  }

  if (error instanceof Error) {
    if (error.message.includes('OPENAI_API_KEY')) {
      return 'OpenAI APIキーが未設定です。.env を確認してください。';
    }
    if (isGcsError(error)) {
      return '写真のアップロードに失敗しました。Cloud Storage の権限とバケット名を確認してください。';
    }
    if (isFirestoreError(error)) {
      return 'データの保存に失敗しました。Firestore の設定（FIRESTORE_DATABASE_ID）を確認してください。';
    }
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }
  }

  return fallback;
}
