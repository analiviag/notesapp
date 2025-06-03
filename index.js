import dotenv from "dotenv";
dotenv.config();

import { connect } from "./connect.js";
import { app } from "./server.js";

connect(process.env.DB_CONN)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((e) => console.error(e));
