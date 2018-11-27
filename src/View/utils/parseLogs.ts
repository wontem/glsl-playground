const REGEX_SHADER_LOG = /^(\w+):\s(\d+):(\d+):\s'(.*?)'\s:\s(.*)$/mg;

interface ParsedLogString {
  fullMessage: string;
  level: string;
  file: string;
  item: string;
  message: string;
  line: number;
}

export function parseLogs(log: string): ParsedLogString[] {
  const matches: string[][] = [];

  while (true) {
    const match = REGEX_SHADER_LOG.exec(log);
    if (match === null) {
      break;
    }
    matches.push(match);
  }

  const parsedLogs: ParsedLogString[] = matches.map(
    ([fullMessage, level, file, line, item, message]) => {
      return {
        fullMessage,
        level,
        file,
        item,
        message,
        line: parseInt(line, 10),
      };
    },
  );

  return parsedLogs;
}
