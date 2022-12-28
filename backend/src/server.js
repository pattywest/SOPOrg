import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import DocumentRoutes from './routes/document.routes.js';
import SOPRoutes from './routes/sop.routes.js';
import UserRoutes from './routes/user.routes.js';
import DirectoryRoutes from './routes/directory.routes.js';
import AuthRoutes from './routes/auth.routes.js';

const PORT = process.env.PORT || 8080;
const app = express();
app.use(fileUpload(), cors(), bodyParser.json());
app.use('/files', express.static(`${process.env.PROJECT_PATH}/sop-files`));

// default route - returns the API version
app.get('/', (req, res) => {
  res.json({ version: process.env.npm_package_version });
});

// register other routes
UserRoutes(app);
SOPRoutes(app);
DocumentRoutes(app);
DirectoryRoutes(app);
AuthRoutes(app);
UserRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
