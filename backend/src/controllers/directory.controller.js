import Directory from '../models/directory.model.js';
import SOP from '../models/sop.model.js';

const create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: 'No Directory found in request body.' });
    return;
  }

  const newDir = new Directory(req.body);
  Directory.create(newDir, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res
          .status(409)
          .send({ message: 'Error: Duplicate directories detected.' });
      } else {
        res.status(500).send({
          message: 'An error occurred while creating the directory.',
        });
      }
    } else {
      res.sendStatus(201);
    }
  });
};

const getAll = (req, res) => {
  Directory.getAll((err, directories) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching directories.',
      });
      return;
    }

    // Simply return the directories if the user didn't ask for the SOPs to be included
    if (req.query.include_sops !== 'true') {
      res.send(directories);
      return;
    }

    Directory.getAllSOPLinks((err, directory_sop_links) => {
      if (err) {
        res.status(500).send({
          message: 'An error occurred while fetching documents.',
        });
        return;
      }

      SOP.getAll((err, sops) => {
        if (err) {
          res.status(500).send({
            message: 'An error occurred while fetching documents.',
          });
        }
  
        console.log(directory_sop_links);
        directories.forEach((dir) => {
          dir.sops = sops.filter((sop) =>
            directory_sop_links.find(({ directory_id, sop_id }) =>
              dir.id == directory_id && sop.id == sop_id
            ));
        });
        res.send(directories);
      });
    });

  });
};

const getById = (req, res) => {
  Directory.getById(req.params.id, (err, dir) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching the directory.',
      });
      return;
    }
    res.send(dir);
  });
};

const getSopsIdsByDirectoryId = (req, res) => {
  Directory.getSopsIdsByDirectoryId(req.params.id, (err, dir) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while fetching the directory.',
      });
      return;
    }
    res.send(dir);
  });
};

const deleteById = (req, res) => {
  Directory.deleteById(req.params.id, (err, dir) => {
    if (err) {
      res.status(500).send({
        message: 'An error occurred while deleting the directory.',
      });
      return;
    }
    res.send(dir);
  });
};

export default { create, getAll, getById, getSopsIdsByDirectoryId, deleteById };
