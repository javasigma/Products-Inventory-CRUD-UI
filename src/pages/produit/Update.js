import './Update.css';
import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

const Update = () => {
    const { id } = useParams(); // Extract the product ID from the URL
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: "",
        designation: "",
        marque: "",
        fournisseur: "",
        quantite: "",
        prixtva: ""
    });

    // Handle input changes
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Fetch the product details when the component mounts
    useEffect(() => {
        const fetchProduit = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/ecom_drog/produitmagasinbricolage/${id}`);              
                const data = await response.json();
                setFormData(data); // Populate form fields with fetched data
            } catch (error) {
                console.error("Error fetching product:", error.message);
            }
        };
        fetchProduit();
    }, [id]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        try {
            const response = await fetch(`http://localhost:8080/api/ecom_drog/produitmagasinbricolage/${id}`, {
                method: 'PATCH', // Use PUT or PATCH depending on your API
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData), // Send updated data to the server
            });

            const data = await response.json();
            
            console.log("Product updated successfully", data);
            navigate('/'); // Redirect to the dashboard or home page after successful update
        } catch (error) {
            console.error("Error updating product:", error.message);
        }
    };

    return (
        <div className="center-form">
            <h1>Modifier Produit</h1>
            <Form onSubmit={handleSubmit}>
                {/* Nom */}
                <Form.Group controlId="formBasicsName">
                    <Form.Control
                        type="text"
                        name="nom"
                        placeholder="Entrer nom de produit"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                {/* Désignation */}
                <Form.Group controlId="formBasicsDesignation">
                    <Form.Control
                        type="text"
                        name="designation"
                        placeholder="Entrer désignation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                {/* Marque */}
                <Form.Group controlId="formBasicsMarque">
                    <Form.Control
                        type="text"
                        name="marque"
                        placeholder="Entrer marque"
                        value={formData.marque}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                {/* Fournisseur */}
                <Form.Group controlId="formBasicsFournisseur">
                    <Form.Control
                        type="text"
                        name="fournisseur"
                        placeholder="Entrer fournisseur"
                        value={formData.fournisseur}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                {/* Quantité */}
                <Form.Group controlId="formBasicsQuantite">
                    <Form.Control
                        type="number"
                        name="quantite"
                        placeholder="Entrer quantité"
                        value={formData.quantite}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                {/* Prix TVA */}
                <Form.Group controlId="formBasicsPrixtva">
                    <Form.Control
                        type="number"
                        name="prixtva"
                        placeholder="Entrer prix unitaire + TVA"
                        value={formData.prixtva}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                {/* Submit Button */}
                <Button variant="primary" type="submit" className="w-100 mt-3">
                    Safi BDLT SL3A
                </Button>
            </Form>
        </div>
    );
};

export default Update;