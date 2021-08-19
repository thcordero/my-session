import React, { useState, useEffect } from "react";
import axios from "../axios"
import { useParams } from "react-router";

const List = () => {

    const [inputNewItem, setInputNewItem] = useState("");
    const [items, setItems] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        axios.get("/api/secrets/" + id).then(res => {
            setItems(res.data);
            console.log(res.data);
            setLoadingList(false);
        });
    }, [])

    const handleNewItemChange = event => {
        const newValue = event.target.value;
        setInputNewItem(newValue);
    }

    // const handleKeypress = event => {
    //     if (event.key === "Enter") {
    //         console.log("Enter pressed");
    //     }
    // }

    const handleAddItem = (event) => {

        axios.post("/api/secrets/" + id, { item: inputNewItem }).then(res => {

            console.log(res.data);
            setItems(prevValue => [...prevValue, res.data]);

        });
        setInputNewItem("");
        event.preventDefault();
    }

    const handleDeleteItem = itemId => {

        setItems(prevValue => {
            return prevValue.filter((item) => {
                return item._id !== itemId;
            });
        });


        axios.delete("/api/secrets/" + id, { data: { itemId } }).then(res => {

            console.log(res.data);

        });

    }

    const handleChecked = itemId => {
        setItems(prevValue => {
            return prevValue.filter((item) => {
                if (item._id === itemId) {
                    axios.patch("/api/secrets/" + id, { checkedItemId: itemId, checkedValue: !item.isChecked }).then(res => {
                        console.log(res.data);
                    });
                    item.isChecked = !item.isChecked;
                    return item;
                }
                else {
                    return item;
                }

            });
        });

    }

    return <div className="to-do-list">

        <form className="add-item" onSubmit={handleAddItem}>
            <input
                onChange={handleNewItemChange}
                // onKeyPress={handleKeypress}
                value={inputNewItem}
                name="NewItem"
                placeholder="Add an item..."
                autoComplete="off" />

            <input className="add-button btn btn-block" type="submit" value="Add" />
        </form>

        <hr />
        {
            loadingList ? <p>loading list...</p> : <div className="to-do-list-items">


                {
                    items.map((item, index) => {

                        return <div key={item._id} className="item">
                            <div className="item-checkbox">
                                <input name={"item" + item._id} type="checkbox" checked={item.isChecked} onChange={() => handleChecked(item._id)} />
                                <div className="item-text">
                                    <span style={{ textDecoration: item.isChecked ? "line-Through" : "none" }}>

                                        {"  " + item.item}

                                    </span>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteItem(item._id)}>x</button>
                        </div>
                    })
                }

            </div>
        }

    </div>

}

export default List;

