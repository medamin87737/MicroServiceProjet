package tn.esprit.spring.mscandidat4twin6;

public class Job {
    public int getId() {
        return id;
    }

    public String getService() {
        return service;
    }

    public boolean isEtat() {
        return etat;
    }

    private int id;

    public void setId(int id) {
        this.id = id;
    }

    public void setService(String service) {
        this.service = service;
    }

    public void setEtat(boolean etat) {
        this.etat = etat;
    }

    public Job() {};
    public Job(int id, String service, boolean etat) {
        this.id = id;
        this.service = service;
        this.etat = etat;
    }

    private String service;
    private boolean etat;
}
