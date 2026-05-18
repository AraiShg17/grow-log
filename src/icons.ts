/**
 * Material Symbols アイコン名（このファイルが唯一の定義元）
 *
 * 表示: <MaterialIcon name={icons.pottedPlant} />
 */

/** アプリで使うアイコン名 */
export const icons = {
  pottedPlant: 'potted_plant',
  psychiatry: 'psychiatry',
  tempPreferencesEco: 'temp_preferences_eco',
  add: 'add',
  photoCamera: 'photo_camera',
  darkMode: 'dark_mode',
  lightMode: 'light_mode',
  edit: 'edit',
  delete: 'delete',
  check: 'check',
  close: 'close',
  waterDrop: 'water_drop',
  compost: 'compost',
  chat: 'chat',
} as const;

export type IconName = (typeof icons)[keyof typeof icons];

/** 使用アイコン一覧（型の参照用） */
export const iconNames = Object.values(icons);
