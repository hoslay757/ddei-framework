const buttons = import.meta.glob('./buttons/*.vue', { eager: true })


const DDeiCoreComponents = {}
DDeiCoreComponents.addComponents = (editor) => {
  let components = {}
  for (let i in buttons) {
    if (buttons[i].default) {
      let button = buttons[i].default;
      let name = "ddei-core-" + button.name
      button.name = name;
      components[name] = button
    }
  }

  return components
}

export default DDeiCoreComponents