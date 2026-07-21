const IS_DEV = import.meta.env.DEV

function formatMessage(level, prefix, message, data) {
  const timestamp = new Date().toISOString()
  const prefixStr = prefix ? `[${prefix}]` : ''
  const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : ''
  return `${timestamp} ${level.toUpperCase()} ${prefixStr} ${message}${dataStr}`
}

export const logger = {
  debug(message, data) {
    if (IS_DEV) {
      console.debug(formatMessage('DEBUG', null, message, data))
    }
  },
  
  info(message, data) {
    if (IS_DEV) {
      console.info(formatMessage('INFO', null, message, data))
    }
  },
  
  warn(message, data) {
    if (IS_DEV) {
      console.warn(formatMessage('WARN', null, message, data))
    }
  },
  
  error(message, data) {
    console.error(formatMessage('ERROR', null, message, data))
  }
}

export default logger
