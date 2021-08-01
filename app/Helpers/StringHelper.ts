export default class StringHelper {
  public static toRGB(text, a) {
    var hash = 0
    if (text.length === 0) return hash
    for (var i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
      hash = hash & hash
    }
    var rgb = [0, 0, 0]
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 255
      rgb[i] = value
    }
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`
  }

  public static calculateGrowth(value, previousValue) {
    const diffValue = previousValue ? value - previousValue : 0

    const multiplier = previousValue > 0 ? 100 : 1
    const growth = Math.round((diffValue / Math.max(previousValue, 1)) * multiplier)
    if (growth !== 0) {
      return `(${growth > 0 ? '+' : '-'}${Math.abs(growth)}%)`
    }
    return ''
  }
}
