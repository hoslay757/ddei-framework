import Layout from './StandardLayout.vue';

let DDeiCoreLayouts = {}
DDeiCoreLayouts.addLayouts = (editor) => {
  let returnLayouts = {}

  let name = "ddei-core-" + Layout.name
  Layout.name = name;
  Layout.install = (app) => {
    app.component(name, Layout)
    return app
  }
  returnLayouts[name] = Layout
  return returnLayouts;
}

export default DDeiCoreLayouts