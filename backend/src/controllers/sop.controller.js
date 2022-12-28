import SOP from '../models/sop.model.js';
import Document from '../models/document.model.js';

const create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: 'No SOP found in request body.' });
    return;
  }

  const newSop = new SOP(req.body);

  SOP.create(newSop, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).send({ message: 'Error: Duplicate SOP detected.' });
      } else {
        res.status(500).send({
          message: 'An error occurred while creating the SOP.',
        });
      }
    } else {
      res.sendStatus(201);
    }
  });
};

// TODO - complete
const update = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: 'No SOP found in request body.' });
    return;
  }

  const updatedSop = new SOP(req.body);

  SOP.update(req.params.id, updatedSop, (err) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while updating the SOP.',
      });
    } else {
      res.sendStatus(201);
    }
  });
};

const getAll = (req, res) => {
  SOP.getAll((err, sops) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching SOP\'s.',
      });
      return;
    }

    // Simply return the SOP's if the user didn't ask for the documents to be included
    if (req.query.include_documents !== 'true') {
      res.send(sops);
      return;
    }

    // TODO - change this to use a filter (by sop id) later
    Document.getAll((err, documents) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while fetching documents.',
        });
      }

      for (const sop of sops) {
        sop.documents = documents.filter(({ sop_id }) => sop_id === sop.id);
      }
      res.send(sops);
    });
  });
};

const getAllFilteredByContent = (req, res) => {
  SOP.getAllByFileContent(req.params.searchTerm, (err, sops) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching SOPs.',
      });
      return;
    }

    // Simply return the SOPs if the user didn't ask for the documents to be included
    if (req.query.include_documents !== 'true') {
      res.send(sops);
      return;
    }

    // TODO - change this to use a filter (by sop id) later
    Document.getAll((err, documents) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while fetching documents.',
        });
      }

      for (const sop of sops) {
        sop.documents = documents.filter(({ sop_id }) => sop_id === sop.id);
      }
      res.send(sops); 
    });
  });
}

const getById = (req, res) => {
  SOP.getById(req.params.id, (err, sop) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching an SOP.',
      });
      return;
    }

    // Simply return the SOP if the user didn't ask for the documents to be included
    if (req.query.include_documents !== 'true') {
      res.send(sop);
      return;
    }

    Document.getAll((err, documents) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while fetching documents.',
        });
      } else {
        sop.documents = documents.filter(({ sop_id }) => sop_id === sop.id);
        res.send(sop);
      }
    });
  });
};

const changeDirectory = (req, res) => {
  console.log(req.body);
  SOP.changeDirectory(
    req.body.sop_id,
    req.body.oldDirectory,
    req.body.newDirectory,
    (err) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while changing the SOPs directory.',
        });
        return;
      } else {
        res.sendStatus(201);
      }
    }
  );
};

const deleteSop = (req, res) => {
  SOP.delete(
    req.body.sop_id,
    req.body.directory_name,
    (err) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while deleting the SOP.',
        });
        return;
      } else {
        res.sendStatus(201);
      }
    }
  );
};

// const getByName = (req, res) => {
//   SOP.getByName(req.params.name, (err, sop) => {
//     if (err) {
//       res.status(500).send({
//         message: 'An error occurred while fetching an SOP.',
//       });
//       return;
//     }

//     // Simply return the SOP if the user didn't ask for the documents to be included
//     if (req.query.include_documents !== 'true') {
//       res.send(sop);
//       return;
//     }

//     Document.getAll((err, documents) => {
//       if (err) {
//         res.status(500).send({
//           message: 'An error occurred while fetching documents.',
//         });
//       } else {
//         sop.documents = documents.filter(({ name }) => name === sop.name);
//         res.send(sop);
//       }
//     });
//   });
// };

export default { create, getAll, getById, update, changeDirectory, getAllFilteredByContent, deleteSop };
