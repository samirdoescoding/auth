import app from "./app.js";
import connectMongoDB from "./config/database.js";
import env from "./config/env.js";

connectMongoDB();

app.listen(env.PORT, () => {
  console.log(`Server is running on ${env.PORT}`);
});