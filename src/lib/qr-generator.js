import QRCode from "qrcode"

export async function generateQRCode(data) {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 300,
    })
    return qrCode
  } catch (error) {
    console.error("Failed to generate QR code:", error)
    throw error
  }
}
