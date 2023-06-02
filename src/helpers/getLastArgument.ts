export default function getLastArgument(args) {
  if (args?.length > 0) {
    return args[args.length - 1]
  }
  return null
}
