/**
 * Utility to automatically detect College based on Roll Number prefix or sheet context.
 * 2451-xxxx -> MVSR Engineering College
 * 1608-xxxx -> Matrusri Engineering College
 */
export function detectCollege(studentId: string, sheetTitle?: string): string {
  const cleanId = (studentId || '').trim();
  const title = (sheetTitle || '').toLowerCase();

  if (cleanId.startsWith('1608') || title.includes('matrusri') || title.includes('mec')) {
    return 'Matrusri Engineering College';
  }

  if (cleanId.startsWith('2451') || title.includes('mvsr')) {
    return 'MVSR Engineering College';
  }

  return 'MVSR Engineering College';
}

export function getCollegeShortName(collegeName: string): string {
  if (collegeName.includes('Matrusri')) return 'Matrusri';
  if (collegeName.includes('MVSR')) return 'MVSR';
  return collegeName;
}
