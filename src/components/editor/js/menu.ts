
const modules = import.meta.glob('../menus/*', { eager: true });

const MENUS = {};
for (let i in modules) {

  let menu = modules[i];
  let newI = i.substring(i.lastIndexOf('/menu-') + 6, i.lastIndexOf('.'))
  MENUS[newI] = menu.default;
}
export default MENUS;
