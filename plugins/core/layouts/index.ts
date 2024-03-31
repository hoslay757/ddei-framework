import Layout from './StandardLayout.vue';



const DDeiCoreLayouts = {}

DDeiCoreLayouts.addLayouts = (editor) => {
  let returnLayouts = {}
  let name = "ddei-core-" + Layout.name
  Layout.name = name;
  returnLayouts[name] = Layout
  return returnLayouts;
}

export default DDeiCoreLayouts