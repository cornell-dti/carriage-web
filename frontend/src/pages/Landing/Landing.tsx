import React, { ReactElement } from 'react';
import styles from './landing.module.css';
import Footer from '../../components/Footer/Footer';
import { Row, Col, Button, Container } from 'react-bootstrap';
import sitting3 from './icons/sitting3.png';
import sitting5 from './icons/sitting5.png';
import sitting7 from './icons/sitting7.png';
import mac from './icons/macbook.png';
import macContent from './icons/macbookContent.png';
import {
  logo,
  dti_logo,
  dti_desc,
  landingCarBuildings,
} from '../../icons/other';

type LandingPropType = {
  students: ReactElement;
  admins: ReactElement;
};

const x = 1;

const Landing = ({ students, admins }: LandingPropType) =>
  x ? (
    <main id="main">
      <div className={styles.background}>
        <Row>
          <Col xs={3}>
            <img
              src={logo}
              width={'50px'}
              height={'17px'}
              className={styles.badge}
              alt="Carriage logo"
            />
            <div>Carriage</div>
          </Col>
          <Col xs={6}></Col>
          <Col xs={3}>
            <Button className={styles.termsButton}>Terms of Service</Button>
          </Col>
        </Row>
        <Row>
          <Row>
            <div className={styles.carriageHeading}>Carriage</div>
          </Row>
        </Row>
        <Row>
          <Col xs={4}>
            <div className={styles.descriptionA}>
              Efficient transit for CU Lift
            </div>
            <div className={styles.authContainer}>
              {students}
              {admins}
            </div>
          </Col>
          <Col xs={8} className={styles.carCol}>
            <img
              width={'892px'}
              height={'573px'}
              src={landingCarBuildings}
              className={styles.car}
              alt="Car and buildings visual"
            />
          </Col>
        </Row>
        <Row className={styles.paneA}>
          <div className={styles.whiteBackground}>
            <Row>
              <Col
                xs={6}
                className={`d-flex justify-content-center d-flex align-items-center`}
              >
                <div className={styles.paneText}>
                  Making Cornell Accessible for all students
                </div>
              </Col>
              <Col xs={6}>
                <Row>
                  <div className={styles.sittingImgdiv}>
                    <img
                      src={sitting3}
                      className={styles.sittingImg}
                      alt="sitting png 1"
                    />
                  </div>
                  <div className={styles.sittingImgdiv}>
                    <img
                      src={sitting5}
                      className={styles.sittingImg}
                      alt="sitting png 2"
                    />
                  </div>
                  <div className={styles.sittingImgdiv}>
                    <img
                      src={sitting7}
                      className={styles.sittingImg}
                      alt="sitting png 3"
                    />
                  </div>
                </Row>
              </Col>
            </Row>
          </div>
        </Row>
        <Row>
          <Col xs={6}>
            <Row>
              <div className={styles.sittingImgdiv}>
                <img
                  src={sitting3}
                  className={styles.sittingImg}
                  alt="sitting png 1"
                />
              </div>
              <div className={styles.sittingImgdiv}>
                <img
                  src={sitting5}
                  className={styles.sittingImg}
                  alt="sitting png 2"
                />
              </div>
              <div className={styles.sittingImgdiv}>
                <img
                  src={sitting7}
                  className={styles.sittingImg}
                  alt="sitting png 3"
                />
              </div>
            </Row>
          </Col>
          <Col
            xs={6}
            className={`d-flex justify-content-center d-flex align-items-center`}
          >
            <div className={styles.paneText}>
              Administrators add students and employees and assign rides on
              Admin Web
            </div>
          </Col>
        </Row>
        <Row>
          <Col
            xs={6}
            className={`d-flex justify-content-center d-flex align-items-center`}
          >
            <div className={styles.paneText}>
              Students schedule, edit, and cancel rides on rider web
            </div>
          </Col>
          <Col xs={6}>
            <Row>
              <div className={styles.sittingImgdiv}>
                <img
                  src={sitting3}
                  className={styles.sittingImg}
                  alt="sitting png 1"
                />
              </div>
              <div className={styles.sittingImgdiv}>
                <img
                  src={sitting5}
                  className={styles.sittingImg}
                  alt="sitting png 2"
                />
              </div>
              <div className={styles.sittingImgdiv}>
                <img
                  src={sitting7}
                  className={styles.sittingImg}
                  alt="sitting png 3"
                />
              </div>
            </Row>
          </Col>
        </Row>
      </div>
    </main>
  ) : (
    <main id="main">
      <div className={styles.home}>
        <div className={styles.main}>
          <div className={styles.left}>
            <img src={logo} className={styles.badge} alt="Carriage logo" />
            <span className={styles.title}>Carriage</span>
          </div>
          <div className={styles.right}>
            <div className={styles.spacing_container}>
              <h1 className={styles.heading}>Login</h1>
              <div className={styles.container}>
                {students}
                {admins}
              </div>
            </div>
            <div className={styles.dti_container}>
              <img src={dti_logo} className={styles.dti_logo} alt="DTI logo" />
              <img src={dti_desc} className={styles.dti_desc} alt="DTI desc" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );

export default Landing;
