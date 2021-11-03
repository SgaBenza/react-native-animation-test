import React from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { GCanvasView } from "@flyskywhy/react-native-gcanvas"
import * as Canova from "canova"

import { curveMonotoneX, line } from "d3-shape"
import { color, MockAnimation } from "../animation.mock"
const { width } = Dimensions.get("window")

const pathLine = line<{ x: number; y: number }>()
  .x((d) => d.x)
  .y((d) => d.y)
  .curve(curveMonotoneX)

export const GCanvasScreen = () => {
  const isGReactTextureViewReady = React.useRef()
  const canvasRef = React.useRef<any>()
  const ctxRef = React.useRef<CanvasRenderingContext2D>()

  const initCanvas = (canvas) => {
    if (canvasRef.current) {
      return
    }

    canvasRef.current = canvas
    ctxRef.current = canvasRef.current.getContext("2d")
  }

  const animationState = React.useRef(MockAnimation.initialState()).current

  const draw = () => {
    // On Android, sometimes this.isGReactTextureViewReady is false e.g.
    // navigate from a canvas page into a drawer item page with
    // react-navigation on Android, the canvas page will be maintain
    // mounted by react-navigation, then if you continually call
    // this drawSome() in some loop, it's wasting CPU and GPU,
    // if you don't care about such wasting, you can delete
    // this.isGReactTextureViewReady and related onIsReady.

    const ctx = ctxRef.current

    // if (ctx && AppState.currentState === "active") {
    if (ctx) {
      const {
        leftPoint,
        rightPoint,
        trackPoint,
        leftVisiblePoints,
        rightVisiblePoints,
        translateX,
        track,
      } = MockAnimation.computeFrameData(animationState)

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      Canova.draw(
        ctx,
        Canova.group({ y: 40, x: -translateX }, [
          (ctx) => {
            ctx.beginPath()

            ctx.strokeStyle = "#C4C4C4"
            ctx.lineWidth = 20
            pathLine.context(ctx)
            pathLine(track)
            ctx.stroke()
          },

          (ctx) => {
            ctx.beginPath()

            ctx.strokeStyle = color.right
            ctx.lineWidth = 4
            pathLine.context(ctx)
            pathLine(rightVisiblePoints)
            ctx.stroke()
          },

          (ctx) => {
            ctx.beginPath()

            ctx.strokeStyle = color.left
            ctx.lineWidth = 4
            pathLine.context(ctx)
            pathLine(leftVisiblePoints)
            ctx.stroke()
          },
          Canova.circle(trackPoint.x, trackPoint.y, 6, {
            fill: "white",
          }),
          Canova.circle(rightPoint.x, rightPoint.y, 6, {
            stroke: color.right,
            strokeWidth: 4,
            fill: "black",
          }),
          Canova.circle(leftPoint.x, leftPoint.y, 6, {
            stroke: color.left,
            strokeWidth: 4,
            fill: "black",
          }),
        ]),
      )

      Object.assign(animationState, MockAnimation.updateAnimationState(animationState))
    }
  }

  React.useEffect(() => {
    let cancel = false

    const loop = () => {
      draw()
      if (!cancel) requestAnimationFrame(loop)
    }
    loop()

    return () => (cancel = true)
  }, [])

  return (
    <View testID="WelcomeScreen" style={styles.wrapper}>
      <GCanvasView
        onCanvasCreate={initCanvas}
        onIsReady={(value) => (isGReactTextureViewReady.current = value)}
        style={styles.gcanvas}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  gcanvas: {
    height: 500,
    width,
  },

  wrapper: { top: 0 },
})
