const buttons = import.meta.glob('./buttons/*.vue', { eager: true })
const pveditors = import.meta.glob('./pveditors/*.vue', { eager: true })


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
  for (let i in pveditors) {
    if (pveditors[i].default) {
      let comp = pveditors[i].default;
      let name = "ddei-core-" + comp.name
      comp.name = name
      components[name] = comp
    }
  }
  return components
}

export default DDeiCoreComponents