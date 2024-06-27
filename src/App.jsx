import { useState, useEffect, useRef ,useCallback} from "react";
import React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import { ConstructionOutlined } from "@mui/icons-material";
const Main = () => {
  const [productList, setProductList] = useState([
    {
      id: 1,
      name: "",
      addDiscount: 1,
      product: "",
      variants: [],
      discount: "",
      discountType: "",
    },
  ]);
  const [parentKeysSelected, setParentKeysSelected] = useState([]);
  const [checkboxData, setCheckboxData] = useState([]);
  const [indexToBeInserted, setIndexToBeInserted] = useState();
  const [productListLoader, setProductListLoader] = useState(false);
  const [productSelectedNum, setproductSelectedNum] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [productApi, setProductApi] = useState([]);
  const [page, setPage] = useState(2);
  const [id, setId] = useState(1);
  const [isAccordionOpen, setIsAccordionOpen] = useState(
    Array(productList.length).fill(false)
  );
  
  useEffect(() => {
    const fetchBlogs = async () => {
      const response = await fetch(
        "https://stageapi.monkcommerce.app/task/products/search?search&page=1&limit=10",
        {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            "x-api-key": "72njgfa948d9aS7gs5",
          },
        }
      );

      const data = await response.json();
      console.log(data);

      const formattedData = data.map((product) => {
        const checkbox = {
          parent: false,
          child: Array(product.variants.length).fill(false),
        };
        return { checkbox, product };
      });
      setProductApi(data);
      setCheckboxData(formattedData);
    };

    fetchBlogs();
  }, []);
  const addProductHandle = () => {
    console.log(parentKeysSelected);
    console.log(checkboxData);
    if(productSelectedNum===0){window.alert("Please select atleast one product to add!");return}
    handleCloseModal();
    
 
    const finalArray = [];
    parentKeysSelected.map((key, index) => {
      const arr = [];
      const temp = {
        id: key + 1,
        addDiscount: 1,
        product: "",
        variants: [],
        discount: "",
        discountType: "",
      };
      temp.product = checkboxData[key].product.title;
      checkboxData[key].checkbox.child.map((childKey, childIndex) => {
        if (childKey) {
          arr.push(childIndex);
        }
      });
      temp.variants = arr.map((childKeyProd) => {
        return checkboxData[key].product.variants[childKeyProd].title;
      });

      finalArray.push(temp);
    });

    setProductList((prevProductList) => {
      // Create a copy of the previous product list
      const updatedProductList = [...prevProductList];

      // Delete the element at indexToBeInserted
      updatedProductList.splice(indexToBeInserted, 1);

      // Split the array into two parts, excluding the deleted element
      const part1 = updatedProductList.slice(0, indexToBeInserted);
      const part2 = updatedProductList.slice(indexToBeInserted);

      // Concatenate part1, finalArray, and part2
      const finalProductList = [...part1, ...finalArray, ...part2];

      return finalProductList;
    });
  };
  
  const toggleAccordion = (index) => {
    setIsAccordionOpen((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };
  const addProduct = () => {
    setProductList((prevList) => {
      const a = {
        id:id,
        name: "",
        addDiscount: 1,
        product: "",
        variants: [],
        discount: "",
        discountType: "",
      };
      setId(id + 1);
      return [...prevList, a];
    });
  };
  const updateArray = (e) => {
    const indexToUpdate = parseInt(e.target.id, 10); // Convert id to integer

    setProductList((prevList) => {
      return prevList.map((item, index) => {
        if (index === indexToUpdate) {
          return {
            ...item,
            addDiscount: item.addDiscount === 1 ? 0 : 1,
          };
        }
        return item;
      });
    });
  };
  const removeProduct = (e) => {
    const indexToUpdate = parseInt(e.target.id, 10); // Convert id to integer
    console.log(e.target);
    setProductList((prevList) => {
      return prevList.filter((item, index) => index !== indexToUpdate);
    });
  };  
  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    console.log("drag started");
    setDragStart(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    // console.log(dragStart)
    console.log("drag over ");

    setDragStart(index);

    e.dataTransfer.dropEffect = "move";
  };
  const handleDragEnd = (e, index) => {
    setDragStart(null);
    console.log("drag end");
  };
  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null) return;
    console.log("drop");

    const updatedList = [...productList];
    const [movedItem] = updatedList.splice(draggedItemIndex, 1);
    updatedList.splice(index, 0, movedItem);
    setDragStart(null);

    setProductList(updatedList);
    setDraggedItemIndex(null);
  };
  const removeVariant = (productIndex, variantIndex) => {
    setProductList((prevList) =>
      prevList.reduce((acc, product, index) => {
        if (index === productIndex) {
          if (product.variants.length === 1) {
            // If the variants length is 1, we don't add this product to the new list
            return acc;
          } else {
            // Otherwise, we filter out the specific variant
            return [
              ...acc,
              {
                ...product,
                variants: product.variants.filter(
                  (_, idx) => idx !== variantIndex
                ),
              },
            ];
          }
        } else {
          // Add the product as is
          return [...acc, product];
        }
      }, [])
    );
  };
  const handleChildCheckbox = (e) => {
    const [parentIndex, childIndex] = e.target
      .getAttribute("data-key")
      .split("&")
      .map(Number);

    setCheckboxData((prevData) => {
      return prevData.map((data, index) => {
        if (index === parentIndex) {
          var temp = false;
          for (var i = 0; i < data.checkbox.child.length; i++) {
            (i === childIndex && data.checkbox.child[i] === false) ||
            (data.checkbox.child[i] === true && i != childIndex)
              ? (temp = temp || true)
              : (temp = temp || false);
            // console.log(data.checkbox.child[i]+" "+childIndex)
          }
          if (!temp) setproductSelectedNum(productSelectedNum - 1);
          temp
            ? setParentKeysSelected((prevKeys) => {
                if (prevKeys.includes(parentIndex)) {
                  // If parentIndex is already present, return the array as is
                  return prevKeys;
                } else {
                  // If parentIndex is not present, add it to the array
                  return [...prevKeys, parentIndex];
                }
              })
            : setParentKeysSelected((prevKeys) => {
                return prevKeys.filter((key) => key !== parentIndex);
              });
          // console.log(temp)
          return {
            ...data,
            checkbox: {
              ...data.checkbox,
              parent: temp,
              child: data.checkbox.child.map((checked, i) =>
                i === childIndex ? !checked : checked
              ),
            },
          };
        } else {
          return data;
        }
      });
    });

    checkboxData[parentIndex].checkbox.parent
      ? setproductSelectedNum(productSelectedNum)
      : setproductSelectedNum(productSelectedNum + 1);
  };
  const handleParentCheckbox = (e) => {
    console.log(e.target);
    const parentIndex = parseInt(e.target.getAttribute("data-key"), 10); // Parse the data-key to get the index as a number
    // setproductSelectedNum()

    checkboxData[parentIndex].checkbox.parent
      ? setParentKeysSelected((prevKeys) => {
          return prevKeys.filter((key) => key !== parentIndex);
        })
      : setParentKeysSelected((prevKeys) => {
          return [...prevKeys, parentIndex];
        });
    checkboxData[parentIndex].checkbox.parent
      ? setproductSelectedNum(productSelectedNum - 1)
      : setproductSelectedNum(productSelectedNum + 1);
    setCheckboxData((prevData) => {
      return prevData.map((data, index) => {
        if (index === parentIndex) {
          return {
            ...data,
            checkbox: {
              ...data.checkbox,
              parent: data.checkbox.parent ? false : true, // Set parent checkbox to false
              child: data.checkbox.child.map((_, i) =>
                !data.checkbox.parent && i == 0 ? true : false
              ), // Set all child checkboxes to false
            },
          };
        } else {
          return data;
        }
      });
    });
    console.log(parentIndex);
  };
  const handleOpenModal = (e) => {
    setIsModalOpen(true);
    setIndexToBeInserted(e.target.id);
    console.log(e.target.id);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCheckboxData((prevData) => {
      return prevData.map((item) => {
        if (item.checkbox.parent === true) {
          return {
            ...item,
            checkbox: {
              ...item.checkbox,
              parent: false,
              child: item.checkbox.child.map(() => false),
            },
          };
        }
        return item;
      });
    });

    setParentKeysSelected([]);
    setproductSelectedNum(0);
    setPage(2);
    const fetchData = async () => {
      // if(search!=null){
      var temp = `https://stageapi.monkcommerce.app/task/products/search?search&page=1&limit=10`;
      const response = await fetch(temp, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          "x-api-key": "72njgfa948d9aS7gs5",
        },
      });
      const data = await response.json();
      // console.log(data);

      const formattedData =
        data && data.length > 0
          ? data.map((product) => {
              const checkbox = {
                parent: false,
                child: Array(product.variants.length).fill(false),
              };
              return { checkbox, product };
            })
          : [];

      console.log(formattedData);

      setCheckboxData(formattedData);
    };
    fetchData();
  };

  
  const debounce = (func) => {
    let timer;
    return function (...args) {
      const context = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        func.apply(context, args);
      }, 500);
    };
  };
  
  const handleSearchChange = (e) => {
    // console.log(e.target.value);
    // setSearch(e.target.value);
    setSearch(e);

    setproductSelectedNum(0);
    setParentKeysSelected([]);
    setPage(2);
    const fetchData = async () => {
      setProductListLoader(true);
      // if(search!=null){
      var temp =
        e === ""
          ? `https://stageapi.monkcommerce.app/task/products/search?search&page=1&limit=10`
          : `https://stageapi.monkcommerce.app/task/products/search?search=${e}&page=1&limit=10`;
      const response = await fetch(temp, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          "x-api-key": "72njgfa948d9aS7gs5",
        },
      });
      const data = await response.json();
      // console.log(data);

      setProductListLoader(false);

      const formattedData =
        data && data.length > 0
          ? data.map((product) => {
              const checkbox = {
                parent: false,
                child: Array(product.variants.length).fill(false),
              };
              return { checkbox, product };
            })
          : [];

      console.log(formattedData);

      setCheckboxData(formattedData);
    };
    fetchData();
  };
  const optimizedFn = useCallback(debounce(handleSearchChange), []);
  const handleScroll = (e) => {
    const bottom =
    Math.floor(e.target.scrollHeight - e.target.scrollTop) <= e.target.clientHeight;
    console.log(
      e.target.scrollHeight +
        " " +
        e.target.scrollTop +
        " " +
        e.target.clientHeight +
        "   " +
        (e.target.scrollHeight - e.target.scrollTop)
    );
    console.log(bottom);

    if (bottom) {
      console.log("Bottom reached");
      // window.alert("REACHED END")
      const fetchData = async () => {
        // if(search!=null){
        var temp =
          search == null
            ? `https://stageapi.monkcommerce.app/task/products/search?search&page=${page}&limit=10`
            : `https://stageapi.monkcommerce.app/task/products/search?search=${search}&page=${page}&limit=10`;
        const response = await fetch(temp, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            "x-api-key": "72njgfa948d9aS7gs5",
          },
        });
        // }
        const data = await response.json();
        console.log(data);

        const formattedData =
          data && data.length > 0
            ? data.map((product) => {
                const checkbox = {
                  parent: false,
                  child: Array(product.variants.length).fill(false),
                };
                return { checkbox, product };
              })
            : [];

        setProductApi(data);
        setCheckboxData((prevCheckboxData) => {
          // Combine previous checkboxData with formattedData
          const updatedCheckboxData = [...prevCheckboxData, ...formattedData];
          return updatedCheckboxData;
        });
      };

      fetchData();
      setPage(page + 1);
    }
  };
  const handleTest = () => {
    console.log(checkboxData);
  };
  const handleDiscountChange = (e) => {
    const { id, value } = e.target;
    const index = parseInt(id); // Convert id to number
  
    setProductList((prevData) =>
      prevData.map((data, i) => {
        if (i === index) {
          return {
            ...data,
            discount: value,
          };
        }
        return data; // Return the unmodified item
      })
    );
    console.log(productList); // This may not reflect the updated state immediately
  };
  const handleDiscountChangeText = (e) => {
    console.log(e.target.value);
    const index = parseInt(e.target.id); // Convert id to number
    setProductList((prevData) =>
      prevData.map((data, i) => {
        if (i === index) {
          return {
            ...data,
            discountType: e.target.value,
          };
        }
        return data; // Return the unmodified item
      })
    );
  };
  
  return (
    <>
      <h1 className="text-3xl font-bold underline text-center py-5">Add products to cart!</h1>

      <div className="flex justify-center w-full">

        <div className="w-1/2 max-[770px]:w-full max-[770px]:p-5">
          {productList.map((i, index) => {
            // console.log(index+" "+i)
            return (
              <>
                <div
                  key={i.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={(e) => handleDragEnd(e, index)}
                  className={`my-3 ${dragStart === index ? "dragging" : ""}`}
                  style={{ opacity: dragStart === index ? 0.5 : 1 }}
                >
                  <div className="flex items-center space-x-2  w-full">
                    <div className="flex items-center w-full border border-gray-300 rounded-l">
                      <input
                        type="text"
                        disabled
                        placeholder="Select a product"
                        value={i.product}
                        className=" px-4 py-2 w-full bg-white"
                      />
                      <button
                        className="text-red px-4 py-2 rounded-r text-green-700"
                        onClick={handleOpenModal}
                        id={index}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          id={index}
                        >
                          <path
                            d="M17.414 2.586a2 2 0 010 2.828l-9.586 9.586a1 1 0 01-.394.263l-4 1.5a1 1 0 01-1.263-1.263l1.5-4a1 1 0 01.263-.394l9.586-9.586a2 2 0 012.828 0zM15 4l-9 9-1-1 9-9 1 1zM3 16h1v1H3v-1z"
                            id={index}
                          />
                        </svg>
                      </button>
                    </div>
                    {i.addDiscount == 1 && (
                      <button
                        class="text-white w-1/2 bg-green-700 font-medium rounded-sm text-sm py-2.5 text-center me-2 mb-2 my-2"
                        onClick={updateArray}
                        id={index}
                      >
                        Add Discount
                      </button>
                    )}
                    {i.addDiscount == 0 && (
                      <div className="flex">
                        <input
                          type="number"
                          className="border border-gray-300 rounded px-4 py-2 w-20 mx-2"
                          id={index}
                          value={i.discount}
                          onChange={handleDiscountChange}
                        />
                        <select
                          // value={discountType}
                          value={i.discountType}
                          onChange={handleDiscountChangeText}
                          className="border border-gray-300 rounded px-4 py-2"
                          id={index}
                        >
                          <option value="flat-off">Flat Off</option>
                          <option value="percent-off">% Off</option>
                        </select>
                      </div>
                    )}
                    {productList.length!=1 && <button onClick={removeProduct} id={index} className="">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 -z-30"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        id={index}
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10 3.636 5.05a1 1 0 011.414-1.414L10 8.586z"
                          clipRule="evenodd"
                          id={index}
                        />
                      </svg>
                    </button>}
                  </div>
                  {i.variants.length > 0 && (
                    <>
                      <div className="flex justify-end mr-7 text-blue-500 underline">
                        <span
                          onClick={() => toggleAccordion(index)}
                          className=" cursor-pointer"
                        >
                          {isAccordionOpen[index]
                            ? "Hide variants"
                            : "Show variants"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {isAccordionOpen[index] && (
                  <div className="p-4  border-gray-300">
                    {i.variants.map((variant, variantIndex) => (
                      <>
                        <div className="flex" key={variantIndex}>
                          <div
                            key={variantIndex}
                            className="p-2 border border-gray-300 rounded my-2 w-4/5 ml-auto"
                          >
                            {variant}
                          </div>
                          {productList.length!=1 && <button
                            onClick={() => removeVariant(index, variantIndex)}
                            className="ml-3"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 -z-30"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              id={index}
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10 3.636 5.05a1 1 0 011.414-1.414L10 8.586z"
                                clipRule="evenodd"
                                id={index}
                              />
                            </svg>
                          </button>}
                        </div>
                      </>
                    ))}
                  </div>
                )}
              </>
            );
          })}

          <button
            className="text-green-700 border-green-700 border rounded-sm w-1/2 font-medium text-sm py-2.5 text-center me-2 mb-2 my-2 hover:bg-green-700 hover:text-white"
            onClick={addProduct}
          >
            Add Product
          </button>
        </div>
      </div>

      <div>
        {/* <button >Open Modal</button> */}

        {isModalOpen && (
          <div
            className="fixed inset-0 flex justify-center items-center"
            onClick={handleCloseModal}
          >
            <div className="fixed inset-0 bg-black bg-opacity-50"></div>{" "}
            {/* Overlay */}
            <div
              className="modal bg-white p-6 rounded-lg shadow-lg z-10"
              style={{ width: "100vw", maxHeight: "90vh", overflowY: "auto" }}
              onClick={(e) => e.stopPropagation()} // Prevents closing the modal when clicking inside it
              onScroll={handleScroll}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Add product</span>
                <button className="" onClick={handleCloseModal}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10 3.636 5.05a1 1 0 011.414-1.414L10 8.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center max-w-md mx-auto my-4 border border-gray-300 rounded-md">
                <span className="p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                  >
                    <path d="M21.71 20.29l-5.39-5.38A7.935 7.935 0 0018 10a8 8 0 10-8 8c1.85 0 3.54-.63 4.91-1.68l5.38 5.39a1 1 0 001.42-1.42zM10 16a6 6 0 110-12 6 6 0 010 12z" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="w-full p-3 border-none focus:outline-none"
                  placeholder="Search product"
                  // value={searchTerm}
                  // onChange={handleSearchChange}
                  onChange={(e) => optimizedFn(e.target.value)}
                  // onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {!productListLoader ? (
                <div>
                  {checkboxData.length === 0 ? (
                    <h1>Data not found!!</h1>
                  ) : (
                    <div className="modal-content">
                      {checkboxData.map((item, i) => (
                        <div key={i}>
                          <div className="flex items-center my-3">
                            <input
                              type="checkbox"
                              className="check1"
                              data-key={i}
                              id={item.product.title.replace(
                                /[^a-zA-Z0-9]/g,
                                "-"
                              )}
                              checked={item.checkbox.parent}
                              onChange={handleParentCheckbox}
                            />
                            <div className="border border-gray-300 rounded mx-4">
                              <img
                                src={
                                  item.product.image.src ||
                                  "https://www.mykite.in/kb/NoImageFound.jpg.png"
                                }
                                alt=""
                                width={40}
                                className="border border-gray-100 rounded"
                                loading="lazy"
                              />
                            </div>
                            <label
                              for={item.product.title.replace(
                                /[^a-zA-Z0-9]/g,
                                "-"
                              )}
                              className="cursor-pointer"
                            >
                              {item.product.title}
                            </label>
                            {/* <div>{item.product.title}</div> */}
                          </div>
                          <hr />
                          {item.product.variants.map((variant, index) => (
                            <div
                              key={index}
                              className="flex items-center ml-5 my-2"
                            >
                              <div className="flex">
                                <input
                                  type="checkbox"
                                  className="check2"
                                  data-key={i + "&" + index}
                                  onChange={handleChildCheckbox}
                                  checked={item.checkbox.child[index]}
                                  id={
                                    variant.title.replace(
                                      /[^a-zA-Z0-9]/g,
                                      "-"
                                    ) +
                                    i +
                                    "&" +
                                    index
                                  }
                                />
                                <label
                                  for={
                                    variant.title.replace(
                                      /[^a-zA-Z0-9]/g,
                                      "-"
                                    ) +
                                    i +
                                    "&" +
                                    index
                                  }
                                  className="mx-3 cursor-pointer"
                                >
                                  {variant.title}
                                </label>
                              </div>
                              <div className="ml-auto">₹{variant.price}</div>
                            </div>
                          ))}
                          <hr />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif"
                  alt=""
                />
              )}
              {(checkboxData.length != 0 && checkboxData.length % 10 === 0) ||
              (page <= 33 &&
                checkboxData.length % 10 === 0 &&
                checkboxData.length != 0) ? (
                <div className="flex justify-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif"
                    alt=""
                    width={150}
                  />
                </div>
              ) : (
                ""
              )}
              <div className="sticky bottom-0 py-5 bg-white z-20 flex justify-between items-center">
                <div>{productSelectedNum} selected products!</div>
                <div className="flex">
                  <div className=" mx-5 text-green-700 border-green-700 border rounded-sm px-5 font-medium text-sm py-2.5 text-center  hover:bg-green-700 hover:text-white">
                    <button onClick={handleCloseModal}>Cancel</button>
                  </div>
                  <div className="  text-green-700 border-green-700 border rounded-sm px-5 font-medium text-sm py-2.5 text-center  hover:bg-green-700 hover:text-white">
                    <button onClick={addProductHandle}>Add</button>
                  </div>
                </div>
              </div>
            </div>
            {/* Black Background Div Fixed at Bottom */}
            {/* <div className="fixed bottom-0 left-0 h-12 bg-black z-20" style={{width:'80vw'}}></div> */}
          </div>
        )}
      </div>
      {/* <button variant="outlined" onClick={handleTest}>
        Open dialog
      </button> */}
      
    </>
  );
};

export default Main;
