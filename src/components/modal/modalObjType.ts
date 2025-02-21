export type modalObjectType = {
  show: boolean,
  title: string,
  message: string,
  id: string
}

export const initModalObj: modalObjectType = {
  show: false,
  title: 'title',
  message: 'message',
  id: "0"
}

export type waitModalObjectType = {
  show: boolean,
  message: string,
}

export const initWaitModalObj: waitModalObjectType = {
  show: false,
  message: 'Please wait...',
}