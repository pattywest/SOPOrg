import Document from '../models/document.model.js';
import SOP from '../models/sop.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/auth.config.js';

const uploadNew = (req, res) => {
  // Verify file
  if (!req.files || !req.body) {
    res.status(400).send({
      message: 'Error. No file or content was found.',
    });
  }

  const file = req.files.file;
  const sopName = file.name;
  const directoryName = req.body.directory_name;
  const editorId = req.body.editor_id;

  // Create SOP object
  const sopObject = new SOP({
    name: sopName,
    latest_version_number: 1,
  });

  // 1. Create a sub-directory for the SOP in the specified directory name
  // 2. Put SOP object into database
  SOP.create(sopObject, directoryName, (err, data) => {
    if (err)
      return res.status(500).send({
        message:
          'An error occurred finding the linked SOP. Please retry upload.',
      });

    // Create document object
    const documentObject = new Document({
      original_file_name: file.name,
      location: null, // this gets updated below
      editor_id: editorId,
      sop_id: data.insertId,
      version_number: 1,
    });

    // 1. Put document in specificed sub-directory
    // 2. Put document into database
    Document.uploadNew(documentObject, file, directoryName, (err, data2) => {
      if (err)
        return res.status(501).send({
          message:
            'An error occurred finding the linked SOP. Please retry upload.',
        });

      SOP.update(
        data.insertId,
        { latest_version_document_id: data2.id },
        (err) => {
          if (err) {
            res.status(500).send({
              message: 'Error trying to upload the document.',
            });
            return;
          }
          res.send(data2);
        }
      );
    });
  });
};

const updateExisting = (req, res) => {
  // Verify file
  if (!req.files || !req.body) {
    res.status(400).send({
      message: 'Error. No file or content was found.',
    });
  }

  const file = req.files.file;
  const sopId = req.body.sop_id;
  const editorId = req.body.editor_id;
  const directoryName = req.body.directory_name;

  // Find the latest version number to increment it
  SOP.getById(req.body.sop_id, (err, sop) => {
    if (err)
      return res.status(500).send({
        message:
          'An error occurred finding the linked SOP. Please retry upload.',
      });

    // Create document object
    const documentObject = new Document({
      original_file_name: file.name,
      location: null, // this gets updated below
      editor_id: editorId,
      sop_id: sopId,
      version_number: sop.latest_version_number + 1,
    });

    // Upload document and put document into database
    Document.updateExisting(
      documentObject,
      file,
      directoryName,
      (err, data) => {
        if (err) {
          res.status(500).send({
            message: 'Error trying to upload the document.',
          });
          return;
        }
        // Update the `latest_version_number` and 'latest_version_document_id' column on the SOP
        SOP.update(
          sopId,
          {
            latest_version_number: sop.latest_version_number + 1,
            latest_version_document_id: data.insertId,
          },
          (err) => {
            if (err) {
              res.status(500).send({
                message: 'Error trying to upload the document.',
              });
              return;
            } else {
              res.status(200).json({ id: data.insertId });
            }
          }
        );
      }
    );
  });
};

const save = (req, res) => {
  // Verify file
  if (!req.files || !req.body) {
    res.status(400).send({
      message: 'Error. No file or content was found.',
    });
  }

  const file = req.files.file;
  const sopId = req.body.sop_id;
  const editorId = req.body.editor_id;
  const directoryName = req.body.directory_name;

  // Find the latest version number to increment it
  SOP.getById(req.body.sop_id, (err, sop) => {
    if (err)
      return res.status(500).send({
        message:
          'An error occurred finding the linked SOP. Please retry upload.',
      });

    // Create document object
    const documentObject = new Document({
      original_file_name: file.name,
      location: null, // this gets updated below
      editor_id: editorId,
      sop_id: sopId,
      version_number: sop.latest_version_number + 1,
    });

    // Upload document and put document into database
    Document.save(documentObject, file, directoryName, (err, data) => {
      if (err) {
        res.status(500).send({
          message: 'Error trying to upload the document.',
        });
        return;
      }
      // Update the `latest_version_number` and 'latest_version_document_id' column on the SOP
      SOP.update(
        sopId,
        {
          latest_version_number: sop.latest_version_number + 1,
          latest_version_document_id: data.insertId,
        },
        (err) => {
          if (err) {
            res.status(500).send({
              message: 'Error trying to upload the document.',
            });
            return;
          } else {
            res.status(200).json({ id: data.insertId });
          }
        }
      );
    });
  });
};

const getAll = (req, res) => {
  Document.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching documents.',
      });
    } else {
      res.send(data);
    }
  });
};

const getById = (req, res) => {
  Document.getById(req.params.id, (err, document) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching a document.',
      });
      return;
    }
    res.send(document);
  });
};

const markForDeletion = (req, res) => {
  // TODO - fix the auth routes/helpers so that the access token logic is done there
  const accessToken = req.headers.authorization?.split(' ')[1];

  jwt.verify(accessToken, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    req.userId = decoded.id;

    Document.markForDeletion(req.params.id, req.userId, (err) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while marking the document for deletion.',
        });
        return;
      }
      res.status(200).send('Document successfully marked for deletion.');
    });
  });
};

const deleteDocument = (req, res) => {
  // TODO - fix the auth routes/helpers so that the access token logic is done there
  const accessToken = req.headers.authorization?.split(' ')[1];

  jwt.verify(accessToken, config.secret, (err, decoded) => {
    // if (err) {
    //   return res.status(401).send({ message: 'Unauthorized!' });
    // }

    Document.delete(req.params.id, (err, doc) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while deleting the document.',
        });
        return;
      }
      res.status(200).send(doc);
      return;
    });
  });
};

const download = (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  jwt.verify(accessToken, config.secret, (err, decoded) => {
    // if (err) {
    //   return res.status(401).send({ message: 'Unauthorized!' });
    // }
    Document.download(req.body, (err, downloadUrl) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while downloading the document.',
        });
        return;
      }
      res.status(200).send(downloadUrl);

      // delete the file after 5 minutes have passed (in case it still exists)
      setTimeout(() => {
        Document.afterDownload(req.body, (err, message) => {
          // do nothing regardless of an error or a message.
          // If an error occurred, it's likely because the file was already deleted
        });
      }, 300000);      
    return;
    });
  });
};

const afterDownload = (req, res) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  jwt.verify(accessToken, config.secret, (err, decoded) => {
    // if (err) {
    //   return res.status(401).send({ message: 'Unauthorized!' });
    // }
    Document.afterDownload(req.body, (err, message) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while downloading the document.',
        });
        return;
      }
      res.status(200).send(message);
      return;
    });
  });
};

export default {
  getAll,
  getById,
  uploadNew,
  updateExisting,
  save,
  markForDeletion,
  deleteDocument,
  download,
  afterDownload,
};
