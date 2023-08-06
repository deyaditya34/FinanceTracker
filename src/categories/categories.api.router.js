const express = require("express");

const getCategory = require("./get-category.api");
const createCategory = require("./create-category.api");
const deleteCategory = require("./delete-category.api");
const searchCatergory = require("./search-category.api");
const getCategoryWithTransactions = require("./get-category-transactions-api")
const router = express.Router();

router.post("/", createCategory);
router.delete("/:id", deleteCategory);
router.get("/search", searchCatergory);
router.get("/:id/transactions", getCategoryWithTransactions)
router.get("/:id", getCategory);

module.exports = router;
