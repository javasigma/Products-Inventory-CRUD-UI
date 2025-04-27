import React, { useState } from "react"; // Fixed import for useState
import "./Produit.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {useNavigate} from "react-router-dom";

const Produit = () => {
    const [formData, setFormData] = useState({ // Fixed typo in `useState`
        nom: "",
        designation: "",
        marque: "",
        fournisseur: "",
        quantite: "",
        prixtva:""
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    }
    const navigate = useNavigate();
    const handleSubmit = async (e) =>{
        e.preventDefault();
        //comment like java
        
        console.log(formData)

        try {// comment on java itj
            const response = await fetch("http://localhost:8080/api/ecom_drog/produitmagasinbricolage",{
                method : "POST",
                headers:{ "Content-Type": "application/json"},
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log("Product created", data);
            navigate("/")
        } catch (error) {
            console.log("Error creating product", error.message);
        }
    }
    return (
        <>
            <div className="center-form"> {/* Fixed typo in className */}
                <h1>Nouveau Produit</h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicsName">
                        <Form.Control
                            type="text"
                            name="nom"
                            placeholder="Entrer nom de produit"
                            value={formData.nom}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="formBasicsDesignation">
                        <Form.Control
                            type="text"
                            name="designation"
                            placeholder="Entrer designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="formBasicsMarque">
                        <Form.Control
                            type="text"
                            name="marque"
                            placeholder="Entrer marque"
                            value={formData.marque}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="formBasicsFournisseur">
                        <Form.Control
                            type="text" // Fixed type from "fournisseur" to "text"
                            name="fournisseur"
                            placeholder="Entrer fournisseur"
                            value={formData.fournisseur}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="formBasicsquantite">
                        <Form.Control
                            type="number" // Fixed type from "prixtva" to "number"
                            name="quantite"
                            placeholder="Entrer quantite"
                            value={formData.quantite}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="formBasicsPrixtva">
                        <Form.Control
                            type="number" // Fixed type from "prixtva" to "number"
                            name="prixtva"
                            placeholder="Entrer prix unitaire +tva"
                            value={formData.prixtva}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">
                        Safi ZID had SL3A
                    </Button>
                </Form>
            </div>
        </>
    );
};

export default Produit;