import { useRef, useState } from "react";
import { loremIpsum } from "lorem-ipsum";
import ViewportList from "react-viewport-list";
import { Dna } from 'react-loader-spinner'
import "../App.css";
var PDFJS = window['pdfjs-dist/build/pdf'];
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';


const App = () => {
	const ref = useRef(null);
	const listRef = useRef(null);
	const [selectedFile, setSelectedFile] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState()

	const changeHandler = async (event) => {
		setIsLoading(true)
		let pdfToImages = await convertPdfToImages(event.target.files[0])
		setSelectedFile(pdfToImages)
		setIsLoading(false)
	};

	const readFileData = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				resolve(e.target.result);
			};
			reader.onerror = (err) => {
				reject(err);
			};
			reader.readAsDataURL(file);
		});
	};

	const convertPdfToImages = async (file) => {
		const images = [];
		const data = await readFileData(file);
		const pdf = await PDFJS.getDocument(data).promise;
		const canvas = document.createElement("canvas");
		for (let i = 0; i < pdf.numPages; i++) {
			const page = await pdf.getPage(i + 1);
			const viewport = page.getViewport({ scale: 1 });
			const context = canvas.getContext("2d");
			canvas.height = viewport.height;
			canvas.width = viewport.width;
			await page.render({ canvasContext: context, viewport: viewport }).promise;
			const url = await canvas.toDataURL()
			images.push({ image: url })
		}
		canvas.remove();
		return images;
	}

	const changeScroolOnEnter = (e) => {
		if (e.key === 'Enter') {
			listRef.current.scrollToIndex(e.target.value - 1)
		}
	}

	const currentViewPortPage = (index) => {
		setCurrentPage(index[0] + 1)
	}


	return (
		<div className="list" ref={ref}>
			<input className="button" type="file" name="file" onChange={changeHandler} />
			<input className="num" value={currentPage} name="tentacles" min="1" max={selectedFile.length} onChange={(e) => { setCurrentPage(e.target.value) }} onKeyPress={(e) => { changeScroolOnEnter(e) }} />
			{isLoading ? <Dna
				visible={true}
				height="100"
				width="100"
				ariaLabel="dna-loading"
				wrapperStyle={{}}
				wrapperClass="dna-wrapper"
			/> : <ViewportList
				ref={listRef}
				viewportRef={ref}
				onViewportIndexesChange={currentViewPortPage}
				items={selectedFile}
				itemMinSize={42}
				margin={16}

			>
				{(item, index) => (
					<div key={index} className='item'>
						<img src={item.image} />
						<div className="brDiv"><div>umar pdf demo</div> <div>{index + 1}/{selectedFile.length}</div></div>
					</div>
				)}
			</ViewportList>}
		</div>
	);
};

export default App;