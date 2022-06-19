export default function (part) {
  let {
    utils,
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    Snippet,
    snippets,
    options,
    measurements,
    complete,
    paperless,
    macro,
  } = part.shorthand()

  const bCircle = 0.552284749831

  console.log('frontPoints')

  // Hide Bella paths
  for (let key of Object.keys(paths)) paths[key].render = false
  for (let i in snippets) delete snippets[i]
  //removing macros not required from Bella
  delete points.titleAnchor
  delete points.__titleNr
  delete points.__titleName
  delete points.__titlePattern
  delete points.scaleboxAnchor
  delete points.__scaleboxImperialBottomLeft
  delete points.__scaleboxMetricBottomLeft
  delete points.__scaleboxImperialTopLeft
  delete points.__scaleboxMetricTopLeft
  delete points.__scaleboxImperialTopRight
  delete points.__scaleboxMetricTopRight
  delete points.__scaleboxImperialBottomRight
  delete points.__scaleboxMetricBottomRight
  delete points.__scaleboxLead
  delete points.__scaleboxTitle
  delete points.__scaleboxText
  delete points.__scaleboxLink
  delete points.__scaleboxImperial
  delete points.__scaleboxMetric

  console.log('Noble front')
  console.log({ highBust: measurements.highBust })
  console.log({ chest: measurements.chest })
  console.log({ underbust: measurements.underbust })
  console.log({ waist: measurements.waist })
  console.log({ waistBack: measurements.waistBack })
  console.log({ bustSpan: measurements.bustSpan })
  console.log({ neck: measurements.neck })
  console.log({ hpsToBust: measurements.hpsToBust })
  console.log({ hpsToWaistFront: measurements.hpsToWaistFront })
  console.log({ hpsToWaistBack: measurements.hpsToWaistBack })
  console.log({ shoulderToShoulder: measurements.shoulderToShoulder })
  console.log({ shoulderSlope: measurements.shoulderSlope })

  // if( options.dartPosition == 'shoulder' ) {
  // }
  points.shoulderDartInside = points.hps.shiftFractionTowards(
    points.shoulder,
    options.shoulderDartPosition
  )
  points.orgShoulder = points.shoulder.clone()
  points.orgArmhole = points.armhole.clone()
  points.orgArmholeCp2 = points.armholeCp2.clone()
  points.orgArmholePitch = points.armholePitch.clone()
  points.orgArmholePitchCp1 = points.armholePitchCp1.clone()
  points.orgArmholePitchCp2 = points.armholePitchCp2.clone()
  let armholePath = new Path()
    .move(points.shoulder)
    ._curve(points.armholePitchCp2, points.armholePitch)
    .curve(points.armholePitchCp1, points.armholeCp2, points.armhole)

  points.armholeDartInside = armholePath.shiftFractionAlong(options.armholeDartPosition)
  points.armholeDartOutside = points.armholeDartInside.clone()

  // paths.armholeTemp = armholePath.clone().setRender(true).attr('class', 'lining')
  console.log({ armholeDartInside: points.armholeDartInside })
  let armholePaths = armholePath.split(points.armholeDartInside)

  let armholePathInside = armholePaths[0].clone().setRender(false)
  let armholePathOutside = armholePaths[1].clone().setRender(false)
  let armholeDartAngle =
    armholePathInside.reverse().shiftAlong(1).angle(armholePathOutside.shiftAlong(1)) - 90

  points.armholeDartArmhole = points.armholeDartInside.shiftFractionTowards(
    points.armholeDartOutside,
    0.5
  )
  points.armholeDartTip = points.armholeDartArmhole.shiftFractionTowards(
    points.bust,
    options.upperDartLength
  )

  console.log({ armholeDartAngle: armholeDartAngle })
  console.log({ dist: points.armholeDartInside.dist(points.armholeDartTip) })
  console.log({ bCircle: bCircle * points.armholeDartInside.dist(points.armholeDartTip) })
  points.armholeCircleInsideCp1 = points.armholeDartInside.shift(
    armholeDartAngle,
    bCircle * points.armholeDartInside.dist(points.armholeDartTip)
  )
  points.armholeCircleOutsideCp1 = points.armholeCircleInsideCp1.clone()

  console.log({ armholePathInside: armholePathInside })
  console.log({ armholePathOutside: armholePathOutside })
  points.shoulderCp1 = armholePathInside.ops[1].cp1.clone()
  points.armholeInsidePitch = armholePathInside.ops[1].to.clone()
  points.armholeInsidePitchCp2 = armholePathInside.ops[1].cp2.clone()
  if (armholePathInside.ops.length == 2) {
    points.armholeInsidePitchCp1 = points.armholeDartInside.clone()
    points.armholeDartInsideCp2 = points.armholeDartInside.clone()
  } else {
    points.armholeInsidePitchCp1 = armholePathInside.ops[2].cp1.clone()
    points.armholeDartInsideCp2 = armholePathInside.ops[2].cp2.clone()
  }
  points.armholeDartOutsideCp1 = armholePathOutside.ops[1].cp1.clone()
  points.armholeOutsidePitch = armholePathOutside.ops[1].to.clone()
  points.armholeOutsidePitchCp2 = armholePathOutside.ops[1].cp2.clone()
  if (armholePathOutside.ops.length == 2) {
    points.armholeOutsidePitchCp1 = points.armhole.clone()
    points.armholeCp2 = points.armhole.clone()
  } else {
    points.armholeOutsidePitchCp1 = armholePathOutside.ops[2].cp1.clone()
    points.armholeCp2 = armholePathOutside.ops[2].cp2.clone()
  }

  console.log({ shoulder: points.shoulder })
  console.log({ shoulderCp1: points.shoulderCp1 })
  console.log({ armholeInsidePitchCp2: points.armholeInsidePitchCp2 })
  console.log({ armholeInsidePitch: points.armholeInsidePitch })
  console.log({ armholeInsidePitchCp1: points.armholeInsidePitchCp1 })
  console.log({ armholeDartInsideCp2: points.armholeDartInsideCp2 })
  console.log({ armholeDartInside: points.armholeDartInside })
  console.log({ armholeDartOutside: points.armholeDartOutside })
  console.log({ armholeDartOutsideCp1: points.armholeDartOutsideCp1 })
  console.log({ armholeOutsidePitchCp2: points.armholeOutsidePitchCp2 })
  console.log({ armholeOutsidePitch: points.armholeOutsidePitch })
  console.log({ armholeOutsidePitchCp1: points.armholeOutsidePitchCp1 })
  console.log({ armholeCp2: points.armholeCp2 })
  console.log({ armhole: points.armhole })

  // paths.armholeInside = new Path()
  //   .move(points.shoulder)
  //   .curve(points.shoulderCp1, points.armholeInsidePitchCp2, points.armholeInsidePitch)
  //   .curve(points.armholeInsidePitchCp1, points.armholeDartInsideCp2, points.armholeDartInside)
  //   .setRender(true)
  //   .attr('class', 'lining')
  paths.armholeInside = new Path()
    .move(points.armholeDartInside)
    .curve(points.armholeDartInsideCp2, points.armholeInsidePitchCp1, points.armholeInsidePitch)
    .curve(points.armholeInsidePitchCp2, points.shoulderCp1, points.shoulder)
    .setRender(false)
    .attr('class', 'lining')

  let rotateAngle =
    points.shoulderDartInside.angle(points.bustA) - points.bustDartTop.angle(points.bustA)
  if (rotateAngle < 0) {
    rotateAngle += 360
  }
  if (rotateAngle > 360) {
    rotateAngle -= 360
  }

  points.shoulderDartCpTop = points.bustDartCpTop.rotate(rotateAngle, points.bustA)
  points.shoulderDartCpBottom = points.bustDartCpBottom.rotate(rotateAngle, points.bustA)

  rotateAngle =
    points.armholeDartInside.angle(points.bustA) - points.bustDartTop.angle(points.bustA)
  if (rotateAngle < 0) {
    rotateAngle += 360
  }
  if (rotateAngle > 360) {
    rotateAngle -= 360
  }

  points.armholeDartCpTop = points.bustDartCpTop.rotate(rotateAngle, points.bustA)
  points.armholeDartCpBottom = points.bustDartCpBottom.rotate(rotateAngle, points.bustA)

  let spreadAngle =
    /*360 -*/ points.bustA.angle(points.bustDartBottom) - points.bustA.angle(points.bustDartTop)
  console.log({ spreadAngle: spreadAngle })

  points.shoulderDartOutside = points.shoulderDartInside.rotate(spreadAngle, points.bustA)
  points.shoulderDartShoulder = points.shoulderDartInside.shiftFractionTowards(
    points.shoulderDartOutside,
    0.5
  )

  points.shoulderDartTip = points.shoulderDartShoulder.shiftFractionTowards(
    points.bust,
    options.upperDartLength
  )
  let dartRatio =
    new Path().move(points.waistDartHem).line(points.waistDartTip).length() /
    new Path().move(points.shoulderDartShoulder).line(points.shoulderDartTip).length()
  console.log({ dartRatio: dartRatio })

  points.shoulder = points.shoulder.rotate(spreadAngle, points.bustA)
  points.armhole = points.armhole.rotate(spreadAngle, points.bustA)
  points.armholeCp2 = points.armholeCp2.rotate(spreadAngle, points.bustA)
  points.armholePitch = points.armholePitch.rotate(spreadAngle, points.bustA)
  points.armholePitchCp1 = points.armholePitchCp1.rotate(spreadAngle, points.bustA)
  points.armholePitchCp2 = points.armholePitchCp2.rotate(spreadAngle, points.bustA)
  points.armholeCircleOutsideCp1 = points.armholeCircleOutsideCp1.rotate(spreadAngle, points.bustA)
  points.armholeDartOutside = points.armholeDartOutside.rotate(spreadAngle, points.bustA)
  points.armholeDartOutsideCp1 = points.armholeDartOutsideCp1.rotate(spreadAngle, points.bustA)
  points.armholeOutsidePitchCp2 = points.armholeOutsidePitchCp2.rotate(spreadAngle, points.bustA)
  points.armholeOutsidePitch = points.armholeOutsidePitch.rotate(spreadAngle, points.bustA)
  points.armholeOutsidePitchCp1 = points.armholeOutsidePitchCp1.rotate(spreadAngle, points.bustA)
  //points.armholeCp2, points.armhole )
  console.log({ shoulder: points.shoulder })
  console.log({ shoulderDartOutside: points.shoulderDartOutside })
  console.log({ shoulderbust: points.bust })
  console.log({ upperDartLength: options.upperDartLength })
  console.log({ waistDartLength: options.waistDartLength })

  paths.armholeOutside = new Path()
    .move(points.armholeDartOutside)
    .curve(points.armholeDartOutsideCp1, points.armholeOutsidePitchCp2, points.armholeOutsidePitch)
    .curve(points.armholeOutsidePitchCp1, points.armholeCp2, points.armhole)
    .setRender(false)
    .attr('class', 'lining')
  paths.armholeTempDart = new Path()
    .move(points.armholeDartOutside)
    ._curve(points.armholeDartCpBottom, points.armholeDartTip)
    .curve_(points.armholeDartCpTop, points.armholeDartInside)
    .setRender(false)
    .attr('class', 'lining')

  points.shoulderDartTipCpDownOutside = points.shoulderDartOutside.shiftFractionTowards(
    points.bust,
    1 + (1 - options.upperDartLength) + (1 - options.waistDartLength) * dartRatio
  )
  // points.shoulderDartTipCpDownOutside = points.shoulderDartTipCpDownOutside.rotate( options.dartOutsideCP *10, points.shoulderDartOutside )

  console.log({ shoulderDartInside: points.shoulderDartInside })
  // points.shoulderDartTipCpDownInside = points.shoulderDartInside.shiftFractionTowards(
  //   points.bust,
  //   1 +(1-options.upperDartLength) +((1 -options.waistDartLength) *dartRatio)
  // )
  points.shoulderDartTipCpDownInside = points.shoulderDartInside.shiftFractionTowards(
    points.shoulderDartTip,
    1 + (1 - options.upperDartLength) + (1 - options.waistDartLength) * dartRatio
  )
  points.armholeDartTipCpDownInside = points.armholeDartTip.shiftFractionTowards(
    // points.waistDartHem,
    points.waistDartLeft,
    1 - options.upperDartLength + (1 - options.waistDartLength) * dartRatio
  )
  console.log({ shoulderDartTipCpDownInside: points.shoulderDartTipCpDownInside })
  console.log({ shoulderDartTipCpDownOutside: points.shoulderDartTipCpDownOutside })
  console.log({ shoulderDartTip: points.shoulderDartTip })
  console.log({ waistDartLeftCp: points.waistDartLeftCp })
  console.log({ waistDartLeft: points.waistDartLeft })

  points.bustAcp = points.waistDartRight.shiftOutwards(points.bustA, 10)

  paths.shoulderInsideSeam = new Path()
    .move(points.waistDartLeft)
    .curve(points.waistDartLeftCp, points.shoulderDartTipCpDownInside, points.shoulderDartTip)
    .line(points.shoulderDartInside)
    .setRender(false)

  paths.armholeInsideSeam = new Path()
    .move(points.waistDartLeft)
    .curve(points.waistDartLeftCp, points.armholeDartTipCpDownInside, points.armholeDartTip)
    // .line(points.armholeDartInside)
    .setRender(false)
    .attr('class', 'lining')
  console.log({ armholeInsideSeam: paths.armholeInsideSeam })

  paths.sOutsideSeam = new Path()
    .move(points.waistDartRight)
    .curve(points.bustAcp, points.shoulderDartTipCpDownOutside, points.shoulderDartOutside)
    .setRender(false)

  points.waistDartRightCp = points.bustAcp.clone()

  let shoulderInsideSeam = new Path()
    .move(points.waistDartLeft)
    .curve(points.waistDartLeftCp, points.shoulderDartTipCpDownInside, points.shoulderDartTip)
    .line(points.shoulderDartInside)
    .setRender(false)
  console.log({ shoulderInsideSeam: shoulderInsideSeam })
  console.log({ waistDartLeft: points.waistDartLeft })
  console.log({ bustA: points.bustA })
  console.log({ dist: points.waistDartLeft.dist(points.bustA) * 0.5 })
  points.waistUpDartLeft = paths.armholeInsideSeam.shiftAlong(
    points.waistDartLeft.dist(points.armholeDartTip) * 0.5
  )
  console.log({ waistUpDartLeft: points.waistUpDartLeft })
  points.waistCircleInsideCp1 = points.waistUpDartLeft.shiftTowards(
    points.waistDartLeft,
    -0.5 * bCircle * points.armholeDartOutside.dist(points.armholeDartTip)
  )
  console.log({ waistCircleInsideCp1: points.waistCircleInsideCp1 })
  points.shoulderDartTipCpDownOutside = points.shoulderDartTipCpDownOutside
    .rotate(-2.5, points.shoulderDartOutside)
    .shiftFractionTowards(points.shoulderDartOutside, 0.2)

  let lInside = shoulderInsideSeam.length()
  console.log({ lInside: lInside })
  let iteration = 1
  let diff = 0
  // points.bustAcp = points.bustA.clone()
  do {
    points.waistDartRight = points.waistDartRight.rotate(diff * 0.1, points.sideHemInitial)

    let outsideSeam = new Path()
      .move(points.waistDartRight)
      .curve(points.bustAcp, points.shoulderDartTipCpDownOutside, points.shoulderDartOutside)

    points.waistUpDartRight = outsideSeam.shiftAlong(
      points.waistDartRight.dist(points.waistDartRightCp) * 0.5
    )
    points.waistUpDartRightCpDown = points.waistUpDartRight.shiftFractionTowards(
      points.waistDartRight,
      0.25
    )
    // points.waistUpDartRightCpUp = points.waistUpDartRight.shiftFractionTowards( points.waistDartRight, -.25 )
    points.waistUpDartRightCpUp = points.waistUpDartRight.shiftFractionTowards(
      points.waistDartRight,
      -0.6
    )
    points.waistCpUp = points.waistDartRight
      .shiftTowards(
        points.sideHemInitial,
        points.waistDartRight.dist(points.waistUpDartRight) * 0.25
      )
      .rotate(90, points.waistDartRight)
    points.waistCircleInsideCp1 = points.armholeDartTip.shiftTowards(
      points.armholeDartTipCpDownInside,
      -0.5 * bCircle * points.armholeDartInside.dist(points.armholeDartTip)
    )

    outsideSeam = new Path()
      .move(points.waistDartRight)
      .curve(points.waistCpUp, points.waistUpDartRightCpDown, points.waistUpDartRight)
      .curve(
        points.waistUpDartRightCpUp,
        points.shoulderDartTipCpDownOutside,
        points.shoulderDartOutside
      )

    console.log({
      step: iteration,
      diff: diff,
      insideSeam: lInside,
      outsideSeam: outsideSeam.length(),
      sOutside: paths.sOutsideSeam.length(),
    })

    diff = shoulderInsideSeam.length() - outsideSeam.length()
    iteration++
  } while ((diff > 1 || diff < -1) && iteration < 200)
  if (iteration >= 200) {
    raise.error('Something is not quite right here!')
  }
  points.waistDartRightCp = points.bustAcp.clone()

  console.log({ shoulderDartTipCpDownInside: points.shoulderDartTipCpDownInside })
  points.armholeDartTipInside = points.armholeDartTip.clone()

  points.waistCircleOutsideCp1 = points.waistUpDartRight.shiftTowards(
    points.waistDartRight,
    -1 * bCircle * points.armholeDartOutside.dist(points.armholeDartTip)
  )
  
  diff = 0
  iteration = 0
  do {
    let dist = points.armholeDartTipInside.dist(points.armholeDartTipCpDownInside)
    console.log({xDartTip: points.armholeDartTipInside.x,yDartTip: points.armholeDartTipInside.y,xCircle:points.waistCircleOutsideCp1.x,yCircle:points.waistCircleOutsideCp1.y, first: points.armholeDartTipInside.x > points.waistCircleOutsideCp1})
    if( points.armholeDartTipInside.x > points.waistCircleOutsideCp1 ) {
      points.armholeDartTipInside.x = points.armholeDartTipInside.x -.5
      points.armholeDartTipInside.y = points.armholeDartTipInside.y +.5
    } else {
      points.waistCircleOutsideCp1 = points.waistCircleOutsideCp1.shiftTowards( points.waistUpDartRight, diff > 0 ? 1 :-1 )
    }
    points.armholeDartTipCpDownInside = points.waistCircleInsideCp1.shiftOutwards(points.armholeDartTipInside, dist)

    // points.waistCircleOutsideCp1 = points.waistUpDartRight.shiftTowards(
    //   points.waistDartRight,
    //   -1 * bCircle * points.armholeDartOutside.dist(points.armholeDartTip)
    // )
    paths.armholeTempCircleOutside = new Path()
      .move(points.armholeDartOutside)
      .curve(points.armholeCircleOutsideCp1, points.waistCircleOutsideCp1, points.waistUpDartRight)
      .curve(points.waistUpDartRightCpDown, points.waistCpUp, points.waistDartRight)
      .setRender(false)
      .attr('class', 'lining')
    paths.armholeTempCircleInside = new Path()
      .move(points.armholeDartInside)
      .curve(points.armholeCircleInsideCp1, points.waistCircleInsideCp1, points.armholeDartTipInside)
      .curve(points.armholeDartTipCpDownInside, points.waistDartLeftCp, points.waistDartLeft)
      .setRender(false)
      .attr('class', 'lining')

      diff = paths.armholeTempCircleOutside.length() - paths.armholeTempCircleInside.length()
      iteration ++ 
      console.log({ i: iteration, diff: diff, armholeTempCircleOutside: paths.armholeTempCircleOutside.length(),armholeTempCircleInside: paths.armholeTempCircleInside.length() })
  } while( (diff < -1 || diff > 1) && iteration < 200 )
  if (iteration >= 200) {
    // raise.error('Something is not quite right here!')
  }

  return part
}
