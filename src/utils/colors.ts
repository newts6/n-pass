import Color from "color"

export function getColorOverlayedOnBackground(
  base: string,
  background: string,
  alpha: number,
): string {
  const baseColor = Color(base)
  const bgColor = Color(background)

  const calculateColorChannel = (baseValue: number, backgroundValue: number): number => {
    return baseValue * alpha + (1 - alpha) * backgroundValue
  }

  const red = calculateColorChannel(baseColor.red(), bgColor.red())
  const green = calculateColorChannel(baseColor.green(), bgColor.green())
  const blue = calculateColorChannel(baseColor.blue(), bgColor.blue())

  return Color.rgb(red, green, blue).hex()
}

export function calculateHoveringColor(colorStr: string): string {
  const color = Color(colorStr)
  return color.isDark() ? getColorOverlayedOnBackground("#FFF", colorStr, 0.4) : getColorOverlayedOnBackground("#000", colorStr, 0.4)
}

export function getBackgroundColorShade(baseColor: string, alpha = 0.7): string {
  return getColorOverlayedOnBackground(baseColor, "#FFF", alpha)
}
