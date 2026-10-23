module.exports = async function (t) {
  for (const r of [1425, 75, 2325, 3525, 975]) {
    await t.eval(`App.show(3); Math.random = () => ${r}/3600 + 1e-9;`);
    await t.click('TransparentWheelOverlay', 3);
    await t.wait(3800);
    t.log(r, 'landed', await t.text('WheelValue', 3));
    await t.shot('spin' + r);
  }
};
