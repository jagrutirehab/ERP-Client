import React, { useState } from "react";
import { connect } from "react-redux";
import img1 from "../../../../assets/images/rorImage/rorschach-blot-1.jpg";
import img2 from "../../../../assets/images/rorImage/rorschach-blot-2.jpg";
import img3 from "../../../../assets/images/rorImage/rorschach-blot-3.jpg";
import img4 from "../../../../assets/images/rorImage/rorschach-blot-4.jpg";
import img5 from "../../../../assets/images/rorImage/rorschach-blot-5.jpg";
import img6 from "../../../../assets/images/rorImage/rorschach-blot-6.jpg";
import img7 from "../../../../assets/images/rorImage/rorschach-blot-7.jpg";
import img8 from "../../../../assets/images/rorImage/rorschach-blot-8.jpg";
import img9 from "../../../../assets/images/rorImage/rorschach-blot-9.jpg";
import img10 from "../../../../assets/images/rorImage/rorschach-blot-10.jpg";
// import img1 from "../../assets/rorImage/rorschach-blot-1.jpg";
import {
    Input,
    Button,
    Form,
    FormGroup,
    Label,
    Container,
    Row,
    Col,
} from "reactstrap";

const imageAray = [img1, img2, img3, img4];
const questionList = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    image: imageAray[i],
    answer: "",
}));

const RorQuestion = () => {
    const [questions, setQuestions] = useState(questionList);
    const [summary, setSummary] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleAnswerChange = (index, value) => {
        const updated = [...questions];
        updated[index].answer = value;
        setQuestions(updated);
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitted Answers:", questions);
        console.log("Summary:", summary);
        console.log("Files:", selectedFiles);
        alert("Form submitted! Check console for values.");
    };

    return (
        <Container className="mt-4 mb-4" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <Form onSubmit={handleSubmit}>
                {questions.map((q, index) => (
                    <FormGroup key={q.id} className="mb-4">
                        <Label className="form-label">Question {q.id}</Label>
                        <img
                            src={q.image}
                            alt={`Question ${q.id}`}
                            className="img-fluid mb-2 w-50"
                        />
                        <textarea
                            type="text"
                            value={q.answer}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            placeholder="Type your response..."
                            rows={5}
                            style={{ display: "block", width: "100%" }}
                        />

                        <div>
                            <div>
                                <h4>Determinants:</h4>
                                <div className="d-flex flex-column">
                                    <Label htmlFor="formF">
                                        <Input type="checkbox" id="formF" /> F (Form)
                                    </Label>
                                    <Label htmlFor="formH">
                                        <Input type="checkbox" id="formH" /> H (Human Movement)
                                    </Label>
                                    <Label htmlFor="formFM">
                                        <Input type="checkbox" id="formFM" /> FM (Animal Movement)
                                    </Label>
                                    <Label htmlFor="formC">
                                        <Input type="checkbox" id="formC" /> C (Color)
                                    </Label>
                                    <Label htmlFor="formShading">
                                        <Input type="checkbox" id="formShading" /> Shading
                                    </Label>
                                </div>
                            </div>
                            <div>
                                <h4>Content:</h4>
                                <div className="d-flex flex-column">
                                    <Label htmlFor="animal">
                                        <Input type="checkbox" id="animal" /> Animal
                                    </Label>
                                    <Label htmlFor="Human">
                                        <Input type="checkbox" id="Human" /> Human
                                    </Label>
                                    <Label htmlFor="Abstract">
                                        <Input type="checkbox" id="Abstract" /> Abstract
                                    </Label>
                                    <Label htmlFor="Nature">
                                        <Input type="checkbox" id="Nature" /> Nature
                                    </Label>
                                </div>
                            </div>
                            <div>
                                <h4>Form Quality:</h4>
                                <div className="d-flex flex-column">
                                    <Label htmlFor="ordinary">
                                        <Input type="checkbox" id="ordinary" /> Ordinary 
                                    </Label>
                                    <Label htmlFor="Human">
                                        <Input type="checkbox" id="Human" /> Minus (Distored)
                                    </Label>
                                    {/* <Label htmlFor="Abstract">
                                        <Input type="checkbox" id="Abstract" /> Abstract
                                    </Label>
                                    <Label htmlFor="Nature">
                                        <Input type="checkbox" id="Nature" /> Nature
                                    </Label> */}
                                </div>
                            </div>

                        </div>

                    </FormGroup>
                ))}

                <FormGroup>
                    <Label for="summary">Summary</Label>
                    <Input
                        type="textarea"
                        id="summary"
                        rows="4"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Write your summary here..."
                    />
                </FormGroup>

                <FormGroup>
                    <Label for="fileUpload">Upload Images</Label>
                    <Input
                        type="file"
                        id="fileUpload"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </FormGroup>

                <Button color="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </Container>
    );
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(RorQuestion);
