import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  // State to hold the list of products
  const [produits, setProduits] = useState([]);
  const navigate = useNavigate();

  // Fetch products when the component mounts
  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/ecom_drog/produitmagasinbricolage");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduits(data); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };
    fetchProduits();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle product deletion
  const handleDelete = async (produitId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/ecom_drog/produitmagasinbricolage/${produitId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // If deletion is successful, remove the product from the state
        setProduits((prevProduits) =>
          prevProduits.filter((produit) => produit.id !== produitId)
        );
        console.log(`Product with ID ${produitId} has been deleted`);
      } else {
        // Handle unsuccessful deletion
        throw new Error(`Failed to delete product with ID ${produitId}. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error.message);
    }
  };

  // Function to handle product update
  const handleUpdate = (produitId) => {
    navigate(`/produit/${produitId}`);
  }; // Added missing closing brace here

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1 className="text-center">Aksema Produits</h1>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Désignation</th>
                <th>Marque</th>
                <th>Fournisseur</th>
                <th>Quantité</th>
                <th>Prix TVA</th>
                <th>Actions</th> {/* Added column for action buttons */}
              </tr>
            </thead>
            <tbody>
              {produits.length > 0 ? (
                produits.map((produit) => (
                  <tr key={produit.id}>
                    <td>{produit.nom}</td>
                    <td>{produit.designation}</td>
                    <td>{produit.marque}</td>
                    <td>{produit.fournisseur}</td>
                    <td>{produit.quantite}</td>
                    <td>{produit.prixtva}</td>
                    <td>
                      {/* Action Buttons */}
                      <Button
                        variant="outline-secondary"
                        onClick={() => handleUpdate(produit.id)}
                      >
                        Renouveler
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDelete(produit.id)}
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    Aucun produit disponible
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;