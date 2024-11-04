type AlertProps = {
  children: React.ReactNode
}
const Alert = ({ children }: AlertProps) => {
  return <div className="text-danger">{children}</div>
}
export { Alert }