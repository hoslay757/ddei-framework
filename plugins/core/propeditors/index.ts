const pveditors = import.meta.glob('./*.vue', { eager: true })


const DDeiCorePVEditors = {}
DDeiCorePVEditors.addPropEditors = (editor) => {
  let components = {}
  for (let i in pveditors) {
    if (pveditors[i].default) {
      let comp = pveditors[i].default;
      components[comp.name] = comp
    }
  }
  return components
}

export default DDeiCorePVEditors