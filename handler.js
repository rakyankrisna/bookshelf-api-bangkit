const {nanoid} = require('nanoid');
const bookshelf = require('./bookshelf');

const addBookHandler = (request, h) => {
	const {
		name,
		year,
		author,
		summary,
		publisher,
		pageCount,
		readPage,
		reading,
	} = request.payload;

	if (!name) {
		const response = h.response({
			status: 'fail',
			message: 'Gagal menambahkan buku. Mohon isi nama buku',
		});
		response.code(400);
		return response;
	}

	if (readPage > pageCount) {
		const response = h.response({
			status: 'fail',
			message:
				'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
		});
		response.code(400);
		return response;
	}

	const id = nanoid(16);
	const finished = readPage === pageCount;
	const insertedAt = new Date().toISOString();
	const updatedAt = insertedAt;

	const newBook = {
		id,
		name,
		year,
		author,
		summary,
		publisher,
		pageCount,
		readPage,
		finished,
		reading,
		insertedAt,
		updatedAt,
	};

	bookshelf.push(newBook);

	const isSuccess = bookshelf.filter(book => book.id === id).length > 0;

	if (isSuccess) {
		const response = h.response({
			status: 'success',
			message: 'Buku berhasil ditambahkan',
			data: {
				bookId: id,
			},
		});
		response.code(201);
		return response;
	}

	const response = h.response({
		status: 'error',
		message: 'Buku gagal ditambahkan',
	});
	response.code(500);
	return response;
};

const getAllBooksHandler = request => {
	const {name, reading, finished} = request.query;

	if (name) {
		const filteredBooks = bookshelf.filter(book =>
			book.name.toLowerCase().includes(name.toLowerCase()),
		);
		return {
			status: 'success',
			data: {
				books: filteredBooks.map(book => ({
					id: book.id,
					name: book.name,
					publisher: book.publisher,
				})),
			},
		};
	}

	if (reading) {
		const filteredBooks = bookshelf.filter(
			book => book.reading === (reading === '1'),
		);
		return {
			status: 'success',
			data: {
				books: filteredBooks.map(book => ({
					id: book.id,
					name: book.name,
					publisher: book.publisher,
				})),
			},
		};
	}

	if (finished) {
		const filteredBooks = bookshelf.filter(
			book => book.finished === (finished === '1'),
		);
		return {
			status: 'success',
			data: {
				books: filteredBooks.map(book => ({
					id: book.id,
					name: book.name,
					publisher: book.publisher,
				})),
			},
		};
	}

	return {
		status: 'success',
		data: {
			books: bookshelf.map(book => ({
				id: book.id,
				name: book.name,
				publisher: book.publisher,
			})),
		},
	};
};

const getDetailBookHandler = (request, h) => {
	const {bookId} = request.params;

	const book = bookshelf.filter(n => n.id === bookId)[0];

	if (book !== undefined) {
		return {
			status: 'success',
			data: {
				book,
			},
		};
	}

	const response = h.response({
		status: 'fail',
		message: 'Buku tidak ditemukan',
	});
	response.code(404);
	return response;
};

const editBookByIdHandler = (request, h) => {
	const {bookId} = request.params;
	const {
		name,
		year,
		author,
		summary,
		publisher,
		pageCount,
		readPage,
		reading,
	} = request.payload;

	const updatedAt = new Date().toISOString();

	if (!name) {
		const response = h.response({
			status: 'fail',
			message: 'Gagal memperbarui buku. Mohon isi nama buku',
		});
		response.code(400);
		return response;
	}

	if (readPage > pageCount) {
		const response = h.response({
			status: 'fail',
			message:
				'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
		});
		response.code(400);
		return response;
	}

	const index = bookshelf.findIndex(book => book.id === bookId);

	if (index !== -1) {
		bookshelf[index] = {
			...bookshelf[index],
			name,
			year,
			author,
			summary,
			publisher,
			pageCount,
			readPage,
			reading,
			updatedAt,
		};

		return {
			status: 'success',
			message: 'Buku berhasil diperbarui',
		};
	}

	const response = h.response({
		status: 'fail',
		message: 'Gagal memperbarui buku. Id tidak ditemukan',
	});
	response.code(404);
	return response;
};

const deleteBookByIdHandler = (request, h) => {
	const {bookId} = request.params;

	const index = bookshelf.findIndex(book => book.id === bookId);

	if (index !== -1) {
		bookshelf.splice(index, 1);
		return {
			status: 'success',
			message: 'Buku berhasil dihapus',
		};
	}

	const response = h.response({
		status: 'fail',
		message: 'Buku gagal dihapus. Id tidak ditemukan',
	});
	response.code(404);
	return response;
};

module.exports = {
	addBookHandler,
	getAllBooksHandler,
	getDetailBookHandler,
	editBookByIdHandler,
	deleteBookByIdHandler,
};
