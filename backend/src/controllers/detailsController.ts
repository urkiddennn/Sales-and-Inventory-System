import { Context } from "hono";
import cloudinary from '../config/cloudinary';
import { Details } from "../model/Details";

export const createDetails = async (c: Context) => {
    const body = await c.req.parseBody()
    const { name, email, contactNumber, address } = body;

    let logoUrl: string | undefined
    const file = body['image']

    if (
        file && file instanceof File) {
        const uploadResult = await cloudinary.uploader.upload(await file.text())
        logoUrl = uploadResult.secure_url
    }

    const detail = new Details({
        name: name as string,
        logoUrl,
        email: email as string,
        contactNumber: Number(contactNumber),
        address: address as string
    })

    await detail.save()
    return c.json(detail)
}
