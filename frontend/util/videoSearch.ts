export interface UnfilteredItem {
  type: string;
  alternatives: { confidence: string; content: string }[];
  start_time?: string;
  end_time?: string;
}
export function filterTranscriptItems(
  transcript: UnfilteredItem[]
): TranscriptItem[] {
  return transcript.filter(
    (item) => item.start_time !== undefined && item.end_time !== undefined
  ) as TranscriptItem[];
}

export interface TranscriptItem {
  type: string;
  alternatives: {
    confidence: string;
    content: string;
  }[];
  start_time: string;
  end_time: string;
}

export function binarySearch(
  transcript: TranscriptItem[],
  targetTime: number,
  isStartTime: boolean
): number {
  let left = 0;
  let right = transcript.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midTime = parseFloat(
      transcript[mid][isStartTime ? "start_time" : "end_time"]
    );

    if (midTime === targetTime) {
      return mid;
    } else if (midTime < targetTime) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

export function getContentInRange(
  transcript: TranscriptItem[],
  currentTimestamp: number,
  windowSize: number
): string {
  const windowStart = currentTimestamp - windowSize / 2;
  const windowEnd = currentTimestamp + windowSize / 2;

  const startIndex = binarySearch(transcript, windowStart, true);
  const endIndex = binarySearch(transcript, windowEnd, false);

  let content = "";
  for (let i = startIndex; i <= endIndex; i++) {
    content += transcript[i].alternatives[0].content + " ";
  }

  return content.trim();
}
