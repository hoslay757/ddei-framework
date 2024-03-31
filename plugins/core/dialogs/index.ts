const dialogs = import.meta.glob('./*.vue', { eager: true })


const DDeiCoreDialogs = {}
DDeiCoreDialogs.addDialogs = (editor) => {
  let returnDialogs = {}
  for (let i in dialogs) {
    if (dialogs[i].default) {
      let dialog = dialogs[i].default;
      returnDialogs[dialog.name] = dialog
    }
  }

  return returnDialogs
}

export default DDeiCoreDialogs