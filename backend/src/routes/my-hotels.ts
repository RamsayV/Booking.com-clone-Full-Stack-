import express, { Response, Request } from "express"
import multer from "multer"
import cloudinary from "cloudinary"
import Hotel from "../models/hotel"
import verifyToken from "../middleware/auth"
import { body } from "express-validator"
import { HotelType } from "../shared/types"

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 //in megabytes
    }
})
// api/my-hotels
router.post("/",
verifyToken,[
    body("name").notEmpty().withMessage("Name is Required"),
    body("city").notEmpty().withMessage("City is Required"),
    body("country").notEmpty().withMessage("Country is Required"),
    body("description").notEmpty().withMessage("Description is Required"),
    body("type").notEmpty().withMessage("Hotel Type is Required"),
    body("pricePerNight")
    .notEmpty()
    .isNumeric()
    .withMessage("Price Per Night is Required"),
    body("facilities").notEmpty().isArray().withMessage("Hotel facilities are Required"),
],
upload.array("imageFiles", 6), async(req:Request, res: Response) => {
    try{
       const imageFiles = req.files as Express.Multer.File[] 
       const newHotel: HotelType = req.body
       //1 upload images to cloudinary

       const imageUrls = await uploadImages(imageFiles)

       newHotel.imageUrls = imageUrls
       newHotel.lastUpdated = new Date();
       newHotel.userId = req.userId

       // upload was succesful? add urls to new hotel
       const hotel = new Hotel(newHotel)
       await hotel.save()
       //  save to db 
       // 201 status bby
       res.status(201).send(hotel)
    } catch(e) {
        console.log("Error creating hotel:", e);
        res.status(500).json({message: "Something went wrong", e})
    }
})


router.get("/", verifyToken, async (req: Request, res: Response) => {
    try {
      const hotels = await Hotel.find({ userId: req.userId });
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ message: "Error fetching hotels" });
    }
  });
  
  router.get("/:id", verifyToken, async (req: Request, res: Response) => {
    const id = req.params.id.toString();
    try {
      const hotel = await Hotel.findOne({
        _id: id,
        userId: req.userId,
      });
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Error fetching hotels" });
    }
  });

  router.put("/:hotelId", verifyToken, upload.array("imageFiles"), 
  async(req: Request, res: Response) => {
    try{
        const updatedHotel: HotelType = req.body
        updatedHotel.lastUpdated = new Date()

        const hotel = await Hotel.findOneAndUpdate({
            _id: req.params.hotelId,
            userId: req.userId,
        },
        updatedHotel,
        {new: true }
        )

        if(!hotel){
            return res.status(404).json({ message: "Hotel not found"})
        }

        const files = req.files as Express.Multer.File[]
        const updatedImagesUrls = await uploadImages(files)


        hotel.imageUrls = [
            ...updatedImagesUrls,
            ...(updatedHotel.imageUrls || [])
        ]

        await hotel.save()
        res.status(201).json(hotel)
    }catch(error){
        res.status(500).json({ message: "something went wrong"})
    }
  })

  
  async function uploadImages(imageFiles: Express.Multer.File[]) {
      const uploadPromises = imageFiles.map(async (image) => {
          const b64 = Buffer.from(image.buffer).toString("base64")
          let dataURI = "data:" + image.mimetype + ";base64," + b64
          const res = await cloudinary.v2.uploader.upload(dataURI)
          return res.url
        })
        
        const imageUrls = await Promise.all(uploadPromises)
        return imageUrls
    }
    
    export default router;